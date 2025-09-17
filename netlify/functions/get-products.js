// netlify/functions/get-products.js
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@sanity/client');

if (!process.env.STRIPE_SECRET_KEY) throw new Error('Missing STRIPE_SECRET_KEY');
if (!process.env.SANITY_PROJECT_ID) throw new Error('Missing SANITY_PROJECT_ID');
if (!process.env.SANITY_DATASET) throw new Error('Missing SANITY_DATASET');

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: '2023-01-01',
  useCdn: false,
});

exports.handler = async () => {
  try {
    const sanityProducts = await client.fetch(`
      *[_type == "product" && defined(stripe.stripePriceId)]{
        _id,
        name,
        description,
        "slug": slug.current,
        images,
        "stripePriceId": stripe.stripePriceId
      }
    `);

    const stripePrices = {};
    await Promise.all(
      sanityProducts.map(async (p) => {
        try {
          const price = await stripe.prices.retrieve(p.stripePriceId);
          stripePrices[p.stripePriceId] = price;
        } catch (err) {
          console.warn(`Stripe price not found for ID: ${p.stripePriceId}`);
        }
      })
    );

    const combinedProducts = sanityProducts.map((product) => {
      const stripePrice = stripePrices[product.stripePriceId];
      return {
        _id: product._id,
        title: product.name, // 🔥 normalize here
        description: product.description,
        slug: product.slug,
        mainImage: product.images?.[0] || null, // 🔥 first image
        stripePriceId: product.stripePriceId,
        price: stripePrice ? stripePrice.unit_amount / 100 : null,
        currency: stripePrice ? stripePrice.currency.toUpperCase() : null,
      };
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(combinedProducts),
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch products' }),
    };
  }
};