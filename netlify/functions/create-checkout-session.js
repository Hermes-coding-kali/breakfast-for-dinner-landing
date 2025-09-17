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

    // Support both shapes: { items: [...] } OR { productId, quantity }
    let items = Array.isArray(body.items) && body.items.length
      ? body.items
      : (body.productId ? [{ productId: body.productId, quantity: body.quantity || 1 }] : []);

    if (!items.length) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing or invalid cart items' }) };
    }

    // Optional tax rates via env
    const taxRates = [];
    if (process.env.STRIPE_PST_TAX_RATE_ID) taxRates.push(process.env.STRIPE_PST_TAX_RATE_ID);
    if (process.env.STRIPE_GST_TAX_RATE_ID) taxRates.push(process.env.STRIPE_GST_TAX_RATE_ID);

    // Validate product IDs in Sanity and read each product's Stripe Price ID
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
        tax_rates: taxRates.length ? taxRates : undefined,
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      // ✅ Back to your dedicated pages:
      success_url: `${process.env.URL}/success`,
      cancel_url: `${process.env.URL}/cancel`,
      shipping_address_collection: { allowed_countries: ['CA'] },
      allow_promotion_codes: true,
    });

    // Return URL for direct redirect
    return { statusCode: 200, body: JSON.stringify({ url: session.url }) };
  } catch (err) {
    console.error('Error creating checkout session:', err);
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
};
