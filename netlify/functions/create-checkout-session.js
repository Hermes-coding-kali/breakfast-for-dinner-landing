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

    const body = JSON.parse(event.body || '{}');
    const email =
      typeof body.email === 'string' && body.email.trim().length > 3
        ? body.email.trim()
        : undefined;

    let items = Array.isArray(body.items) && body.items.length
      ? body.items
      : (body.productId ? [{ productId: body.productId, quantity: body.quantity || 1 }] : []);

    if (!items.length) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing or invalid cart items' }) };
    }

    const ids = items.map((i) => i.productId);
    const sanityProducts = await client.fetch(
      `*[_type == "product" && _id in $ids]{ _id, name, "priceId": stripe.stripePriceId }`,
      { ids }
    );

    const productsById = Object.fromEntries(sanityProducts.map(p => [p._id, p]));

    const lineItems = items.map((i) => {
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
      currency: 'cad', // ⭐️ ADD THIS LINE
      automatic_tax: { enabled: true },
      customer_email: email,
      customer_creation: 'always',
      billing_address_collection: 'auto',
      payment_intent_data: email ? { receipt_email: email } : undefined,
      shipping_options: [
        {
          shipping_rate: 'shr_1S8eOvDgMYpxoSaOrxUIVsU8',
        },
      ],
      shipping_address_collection: { allowed_countries: ['CA'] },
      phone_number_collection: { enabled: true },
      allow_promotion_codes: true,
      success_url: `${process.env.URL}/success`,
      cancel_url: `${process.env.URL}/cancel`,
    });

    return { statusCode: 200, body: JSON.stringify({ url: session.url }) };
  } catch (err) {
    console.error('Error creating checkout session:', err);
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
};