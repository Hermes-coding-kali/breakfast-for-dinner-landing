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
    const { _id, name, price } = JSON.parse(body);

    if (!_id) {
      return { statusCode: 400, body: 'Missing _id for Sanity document' };
    }

    // Fetch the latest version from Sanity
    const doc = await sanityClient.getDocument(_id);

    if (!doc) {
      return { statusCode: 404, body: 'Sanity document not found' };
    }

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

    // --- Product sync logic ---
    if (!doc.stripeProductId) {
      // Create product if it doesn't exist
      product = await stripe.products.create(
        { name },
        { idempotencyKey: _id } // Prevent duplicate creation
      );
    } else {
      // Fetch existing product
      product = await stripe.products.retrieve(doc.stripeProductId);

      // Update name if different
      if (product.name !== name) {
        product = await stripe.products.update(doc.stripeProductId, { name });
      }
    }

    // --- Price sync logic ---
    const needsNewPrice =
      !doc.stripePriceId || doc.price !== price;

    if (needsNewPrice) {
      stripePrice = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(price * 100),
        currency: 'cad',
      });
    } else {
      stripePrice = { id: doc.stripePriceId };
    }

    // --- Update Sanity ---
    await sanityClient
      .patch(_id)
      .set({
        stripeProductId: product.id,
        stripePriceId: stripePrice.id,
        price, // Ensure local price matches
        syncedFrom: 'stripe', // Prevent loop on next webhook
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
