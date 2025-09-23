// netlify/functions/get-product-by-slug.js
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

exports.handler = async (event) => {
  // Use event.queryStringParameters to get the slug from the URL
  const { slug } = event.queryStringParameters;

  if (!slug) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing slug parameter' }),
    };
  }

  try {
    // 1. Fetch the single product from Sanity using the slug
    const sanityProduct = await client.fetch(`
      *[_type == "product" && slug.current == $slug][0]{
        _id,
        name,
        description,
        "slug": slug.current,
        images,
        "stripePriceId": stripe.stripePriceId
      }
    `, { slug }); // Pass the slug as a parameter to the query

    // If no product is found in Sanity, or it's missing a Stripe ID, return an error
    if (!sanityProduct || !sanityProduct.stripePriceId) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Product not found or is not configured for Stripe.' }),
      };
    }

    // 2. Use the stripePriceId from Sanity to fetch the price from Stripe
    const stripePrice = await stripe.prices.retrieve(sanityProduct.stripePriceId);

    // 3. Combine the data from Sanity and Stripe into one object
    //    This structure matches the working get-products.js logic
    const combinedProduct = {
      _id: sanityProduct._id,
      title: sanityProduct.name, // Normalize `name` to `title`
      description: sanityProduct.description,
      slug: sanityProduct.slug,
      mainImage: sanityProduct.images?.[0] || null, // Get the first image
      stripePriceId: sanityProduct.stripePriceId,
      // Get price and currency from the Stripe object
      price: stripePrice ? stripePrice.unit_amount / 100 : null,
      currency: stripePrice ? stripePrice.currency.toUpperCase() : null,
    };

    // 4. Return the final, combined product object
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(combinedProduct),
    };
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch product.' }),
    };
  }
};