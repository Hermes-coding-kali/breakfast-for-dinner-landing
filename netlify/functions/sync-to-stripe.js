// netlify/functions/sync-to-stripe.js
/* eslint-disable no-console */
const crypto = require('crypto');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@sanity/client');

// --- Environment Variable Check ---
const REQUIRED_ENV = [
  'STRIPE_SECRET_KEY',
  'SANITY_PROJECT_ID',
  'SANITY_DATASET',
  'SANITY_API_TOKEN',
  'SANITY_API_VERSION',
  'SANITY_WEBHOOK_SECRET',
];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
  console.error('FATAL ERROR: Missing required env vars:', missing.join(', '));
  throw new Error(`Missing env vars: ${missing.join(', ')}`);
}

const sanityClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: process.env.SANITY_API_VERSION,
});

// --- Final, Corrected Verification Function ---
function verifySanitySignature({ body, secret, signatureHeader, isBase64Encoded }) {
  if (!signatureHeader) {
    throw new Error('Missing Sanity-Webhook-Signature header');
  }

  const signatures = new Map(
    signatureHeader.split(',').map((pair) => {
      const [key, value] = pair.split('=');
      return [key, value];
    })
  );

  const timestamp = signatures.get('t');
  const signature = signatures.get('v1');

  if (!timestamp || !signature) {
    throw new Error('Invalid signature header format. Expected "t=...,v1=..."');
  }

  const fiveMinutesInSeconds = 5 * 60;
  const nowInSeconds = Math.floor(Date.now() / 1000);
  if (nowInSeconds - parseInt(timestamp, 10) > fiveMinutesInSeconds) {
    throw new Error('Signature timestamp is too old');
  }

  const rawBody = isBase64Encoded ? Buffer.from(body, 'base64').toString('utf8') : body;
  const payload = `${timestamp}.${rawBody}`;

  // ⭐️ FIX: Use 'base64url' digest to match Sanity's signature encoding ⭐️
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('base64url');

  if (!crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature))) {
    throw new Error('Signature mismatch');
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors(204);
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });

  try {
    verifySanitySignature({
      body: event.body,
      secret: process.env.SANITY_WEBHOOK_SECRET,
      signatureHeader: event.headers['sanity-webhook-signature'],
      isBase64Encoded: event.isBase64Encoded,
    });
  } catch (err) {
    console.error('[SYNC-ERROR] Signature verification failed:', err.message);
    return json(401, { error: `Unauthorized: ${err.message}` });
  }

  // ... The rest of your function remains the same

  let payload;
  try {
    const raw = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;
    payload = JSON.parse(raw || '{}');
  } catch (err) {
    console.error('[SYNC-ERROR] Invalid JSON:', err.message);
    return json(400, { error: 'Invalid JSON body' });
  }

  const { _id, _rev } = payload || {};
  if (!_id) {
    return json(400, { error: 'Missing Sanity document _id' });
  }
  
  console.log(`[SYNC-INFO] Received webhook for Sanity document: ${_id}`);

  try {
    const doc = await sanityClient.getDocument(_id);
    if (!doc) {
      console.error(`[SYNC-ERROR] Sanity document with ID ${_id} not found.`);
      return json(404, { error: `Sanity document not found: ${_id}` });
    }
    
    const { name, sku, priceCode, stripe: stripeBlock } = doc;
    const stripePriceId = stripeBlock?.stripePriceId;

    if (!stripePriceId) {
      console.error(`[SYNC-ERROR] Sanity document ${_id} is missing a Stripe Price ID.`);
      return json(400, { error: `Sanity document ${_id} is missing a Stripe Price ID (stripe.stripePriceId).` });
    }

    const price = await stripe.prices.retrieve(stripePriceId);
    const stripeProductId = price?.product;
    if (!stripeProductId) {
      throw new Error(`Price ${stripePriceId} not linked to a Product in Stripe.`);
    }

    const metadata = {
        sanityId: _id,
        sku: sku || null,
        priceCode: priceCode || null
    };

    const productData = {
      ...(name && { name }),
      metadata,
    };
    
    const idempotencyKey = `sanity:${_id}:${_rev || Date.now()}`;
    const updated = await stripe.products.update(stripeProductId, productData, { idempotencyKey });

    console.log('[SYNC-SUCCESS] Stripe Product updated successfully!', {
      stripeProductId,
      updatedMetadata: updated.metadata
    });

    return json(200, {
      message: 'Product metadata synced with Stripe successfully',
      productId: stripeProductId,
    });
  } catch (err) {
    console.error('[SYNC-ERROR] Unhandled error:', { message: err.message, stack: err.stack });
    return json(500, { error: 'Internal Server Error' });
  }
};

// --- Helper Functions ---
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Sanity-Webhook-Signature',
};

function json(statusCode, obj) {
  return { statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' }, body: JSON.stringify(obj) };
}

function cors(status = 204) {
  return { statusCode: status, headers: corsHeaders, body: '' };
}