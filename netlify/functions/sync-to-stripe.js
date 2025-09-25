// netlify/functions/sync-to-stripe.js
/* eslint-disable no-console */
const crypto = require('crypto');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@sanity/client');

// ---- Fail fast on missing required env vars
const REQUIRED_ENV = [
  'STRIPE_SECRET_KEY',
  'SANITY_PROJECT_ID',
  'SANITY_DATASET',
  'SANITY_API_TOKEN',
  'SANITY_API_VERSION', // prefer env over hardcoded version, e.g. 2024-08-14
  'SANITY_WEBHOOK_SECRET', // used to verify webhook authenticity
];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
  console.error('Missing required env vars:', missing.join(', '));
  // Throwing during module load will surface fast in logs/build
  throw new Error(`Missing env vars: ${missing.join(', ')}`);
}

const sanityClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: process.env.SANITY_API_VERSION,
});

/**
 * Netlify handler
 */
exports.handler = async (event) => {
  // --- Method + CORS
  if (event.httpMethod === 'OPTIONS') {
    return cors(204);
  }
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method Not Allowed' });
  }

  // --- Verify Sanity webhook signature (prevents spoofed calls)
  try {
    verifySanitySignature({
      body: event.body,
      secret: process.env.SANITY_WEBHOOK_SECRET,
      signatureHeader: event.headers['x-sanity-signature'] || event.headers['X-Sanity-Signature'],
      isBase64Encoded: event.isBase64Encoded,
    });
  } catch (err) {
    console.error('Signature verification failed:', err.message);
    return json(401, { error: 'Unauthorized: invalid signature' });
  }

  // --- Parse body (handles Netlify base64 as well)
  let payload;
  try {
    const raw = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;
    payload = JSON.parse(raw || '{}');
  } catch (err) {
    console.error('Invalid JSON:', err.message);
    return json(400, { error: 'Invalid JSON body' });
  }

  const { _id, _rev } = payload || {};
  if (!_id) {
    return json(400, { error: 'Missing Sanity document _id' });
  }

  try {
    // --- Fetch the Sanity document
    const doc = await sanityClient.getDocument(_id);
    if (!doc) {
      return json(404, { error: `Sanity document not found: ${_id}` });
    }

    const { name, sku, priceCode, stripe: stripeBlock } = doc || {};
    const stripePriceId = stripeBlock?.stripePriceId;

    if (!stripePriceId) {
      return json(400, { error: `Sanity document ${_id} is missing a Stripe Price ID (stripe.stripePriceId).` });
    }

    // --- Retrieve Price to find Product
    let stripeProductId;
    try {
      const price = await stripe.prices.retrieve(stripePriceId);
      stripeProductId = price?.product;
      if (!stripeProductId) {
        throw new Error(`Price ${stripePriceId} not linked to a Product`);
      }
    } catch (err) {
      console.error('Stripe price retrieval error:', safeErr(err));
      return json(404, {
        error: `Could not find a valid Product for Price ID ${stripePriceId}. Ensure the Price exists and is linked to a Product.`,
      });
    }

    // --- Build product update payload
    const metadata = buildMetadata({ sku, priceCode, sanityId: _id });
    const productData = {
      // Only set name when provided; Stripe rejects empty
      ...(name ? { name } : {}),
      metadata,
    };

    // --- Use an idempotency key so retries won’t double-apply
    const idempotencyKey = `sanity:${_id}:${_rev || 'no-rev'}`;

    console.log(
      JSON.stringify(
        {
          msg: 'Syncing Product',
          stripeProductId,
          productData,
          idempotencyKey,
        },
        null,
        2
      )
    );

    const updated = await stripe.products.update(stripeProductId, productData, { idempotencyKey });

    console.log('Sync success', {
      sanityId: _id,
      stripeProductId,
      name: updated.name,
    });

    return json(200, {
      message: 'Product metadata synced with Stripe successfully',
      productId: stripeProductId,
      name: updated.name,
      syncedKeys: Object.keys(productData.metadata || {}),
    });
  } catch (err) {
    console.error('Unhandled error in sync-to-stripe:', safeErr(err));
    const status = err?.statusCode && Number.isInteger(err.statusCode) ? err.statusCode : 500;
    return json(status, { error: err.message || 'Internal Server Error' });
  }
};

/* -------------------- Helpers -------------------- */

/**
 * Build metadata object for Stripe.
 * - Omits undefined keys
 * - Sends null to REMOVE keys when the Sanity field is explicitly empty
 */
function buildMetadata({ sku, priceCode, sanityId }) {
  const out = {};
  // Always set sanityId (back-reference)
  out.sanityId = sanityId;
  // For optional keys, send null if empty string to clear, else set value
  if (sku === '') out.sku = null;
  else if (typeof sku !== 'undefined') out.sku = String(sku);

  if (priceCode === '') out.priceCode = null;
  else if (typeof priceCode !== 'undefined') out.priceCode = String(priceCode);

  return out;
}

/**
 * Verify Sanity webhook signature using HMAC SHA1 (Sanity docs).
 * https://www.sanity.io/docs/webhooks#signing-requests
 */
function verifySanitySignature({ body, secret, signatureHeader, isBase64Encoded }) {
  if (!signatureHeader) throw new Error('Missing X-Sanity-Signature header');
  const raw = isBase64Encoded ? Buffer.from(body, 'base64') : Buffer.from(body, 'utf8');
  const hmac = crypto.createHmac('sha1', secret).update(raw).digest('hex');
  const expected = `sha1=${hmac}`;
  // timingSafeEqual to prevent timing attacks
  const a = Buffer.from(signatureHeader);
  const b = Buffer.from(expected);
  const ok = a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!ok) throw new Error('Signature mismatch');
}

/**
 * Standard JSON response with CORS headers
 */
function json(statusCode, obj) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,X-Sanity-Signature',
    },
    body: JSON.stringify(obj),
  };
}

function cors(status = 204) {
  return {
    statusCode: status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,X-Sanity-Signature',
    },
    body: '',
  };
}

function safeErr(err) {
  return {
    type: err?.type,
    message: err?.message,
    code: err?.code,
    statusCode: err?.statusCode,
    stack: err?.stack?.split('\n')?.[0],
  };
}
