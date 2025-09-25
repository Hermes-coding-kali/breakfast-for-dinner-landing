// netlify/functions/sync-to-stripe.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@sanity/client');

const sanityClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-08-14',
});

exports.handler = async (event) => {
  const { body } = event;

  if (!body) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing request body' })
    };
  }

  try {
    const { _id } = JSON.parse(body);

    if (!_id) {
      return { statusCode: 400, body: 'Missing _id for Sanity document' };
    }

    // Fetch the latest version from Sanity
    const doc = await sanityClient.getDocument(_id);

    if (!doc) {
      return { statusCode: 404, body: 'Sanity document not found' };
    }
    
    // Deconstruct all the fields you need from the Sanity doc
    const { name, price, sku, priceCode } = doc;

    // Avoid loop: if this update was triggered by our own sync
    if (doc.syncedFrom === 'stripe') {
      console.log('Skipping: change originated from Stripe sync.');
      return { statusCode: 200, body: 'No action needed.' };
    }

    // Validate price
    if (typeof price !== 'number' || price <= 0) {
      return { statusCode: 400, body: 'Invalid price value' };
    }

    let product;
    let stripePrice;
    
    // --- Prepare the data payload for Stripe ---
    const productData = {
      name,
      metadata: {
        sku: sku || null,                 // NEW: Pass SKU to metadata
        priceCode: priceCode || null,     // NEW: Pass Price Code to metadata
        sanityId: _id                      // Good practice to store this too
      }
    };

    // --- Product sync logic ---
    if (!doc.stripeProductId) {
      // Create product if it doesn't exist
      product = await stripe.products.create(
        productData, // Use the new data object
        { idempotencyKey: `product-${_id}` } 
      );
    } else {
      // Update the existing product
      product = await stripe.products.update(doc.stripeProductId, productData);
    }

    // --- Price sync logic (no changes needed here) ---
    const needsNewPrice = !doc.stripePriceId || doc.price !== price;

    if (needsNewPrice) {
      stripePrice = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(price * 100),
        currency: 'cad',
      });
    } else {
      stripePrice = { id: doc.stripePriceId };
    }

    // --- Update Sanity (no changes needed here) ---
    await sanityClient
      .patch(_id)
      .set({
        stripeProductId: product.id,
        stripePriceId: stripePrice.id,
        price,
        syncedFrom: 'stripe',
      })
      .commit({ autoGenerateArrayKeys: true });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Product synced with Stripe successfully!',
        productId: product.id,
        priceId: stripePrice.id
      })
    };
  } catch (error) {
    console.error('Error syncing to Stripe:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
};