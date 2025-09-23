// netlify/functions/create-checkout-session.js
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@sanity/client');

if (!process.env.STRIPE_SECRET_KEY) throw new Error('Missing STRIPE_SECRET_KEY');
if (!process.env.SANITY_PROJECT_ID) throw new Error('Missing SANITY_PROJECT_ID');
if (!process.env.SANITY_DATASET) throw new Error('Missing SANITY_DATASET');
if (!process.env.URL) throw new Error('Missing URL for redirect URLs');

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: '2023-01-01',
  useCdn: false,
});

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    // It's safer to get customerInfo from the body here as well
    const { items, customerInfo } = JSON.parse(event.body || '{}');

    // Updated item validation
    const cartItems = Array.isArray(items) && items.length ? items : [];

    if (!cartItems.length) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing or invalid cart items' }) };
    }
    
    // Check for customer email, which is now required
    if (!customerInfo || !customerInfo.email) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing customer email' }) };
    }

    const ids = cartItems.map((i) => i.productId);
    const sanityProducts = await client.fetch(
      `*[_type == "product" && _id in $ids]{ _id, name, "priceId": stripe.stripePriceId }`,
      { ids }
    );

    const productsById = Object.fromEntries(sanityProducts.map(p => [p._id, p]));

    const lineItems = cartItems.map((i) => {
      const p = productsById[i.productId];
      if (!p || !p.priceId) throw new Error(`Invalid product in cart: ${i.productId}`);
      return {
        price: p.priceId,
        quantity: i.quantity || 1,
      };
    });
 
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      automatic_tax: { enabled: true },
      
      shipping_options: [
        {
          shipping_rate: 'shr_1S8eOvDgMYpxoSaOrxUIVsU8',
        },
      ],
      
      success_url: `${process.env.URL}/success`,
      cancel_url: `${process.env.URL}/cancel`,
      shipping_address_collection: { allowed_countries: ['CA'] },
      allow_promotion_codes: true,

      // --- THE FIX: ADDED THIS SECTION ---
      // This ensures a customer object is created in Stripe
      customer_creation: 'always', 
      // This explicitly provides the email for the automatic receipt
      customer_email: customerInfo.email,
      // ------------------------------------
    });

    return { statusCode: 200, body: JSON.stringify({ url: session.url }) };
  } catch (err) {
    console.error('Error creating checkout session:', err);
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
};