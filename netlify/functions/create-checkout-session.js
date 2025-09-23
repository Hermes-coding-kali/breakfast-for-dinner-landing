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

    // --- Pull email from the request (used for Stripe receipts) ---
    const email =
      typeof body.email === 'string' && body.email.trim().length > 3
        ? body.email.trim()
        : undefined;

    // Build items from cart or single product
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

    // --- Create Checkout Session and include an email so Stripe can send receipts ---
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      automatic_tax: { enabled: true },

      // If you already collected the email in your UI, pass it here.
      // Stripe will attach it to the Customer/PaymentIntent and email the receipt.
      customer_email: email, // ok to be undefined if not provided
      customer_creation: 'always', // ensures a Customer is created for future orders
      billing_address_collection: 'auto',

      // (Optional but robust) also set receipt_email on the PaymentIntent.
      // Checkout will ignore this if `email` is undefined.
      payment_intent_data: email ? { receipt_email: email } : undefined,

      // Shipping options already present
      shipping_options: [
        {
          shipping_rate: 'shr_1S8eOvDgMYpxoSaOrxUIVsU8', // <-- your Shipping Rate ID
        },
      ],

      // This line was already here and is required for shipping!
      shipping_address_collection: { allowed_countries: ['CA'] },

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
