// netlify/functions/sync-to-stripe.js
/* eslint-disable no-console */
const crypto = require('crypto');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@sanity/client');

// ---- Environment Variable Check ----
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

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors(204);
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });

  try {
    verifySanitySignature({
      body: event.body,
      secret: process.env.SANITY_WEBHOOK_SECRET,
      signatureHeader: event.headers['x-sanity-signature'],
      isBase64Encoded: event.isBase64Encoded,
    });
  } catch (err) {
    console.error('[SYNC-ERROR] Signature verification failed:', err.message);
    return json(401, { error: 'Unauthorized: invalid signature' });
  }

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
    
    console.log(`[SYNC-INFO] Fetched Sanity document data:`, { name: doc.name, sku: doc.sku, priceCode: doc.priceCode, stripePriceId: doc.stripe?.stripePriceId });

    const { name, sku, priceCode, stripe: stripeBlock } = doc;
    const stripePriceId = stripeBlock?.stripePriceId;

    if (!stripePriceId) {
      console.error(`[SYNC-ERROR] Sanity document ${_id} is missing a Stripe Price ID.`);
      return json(400, { error: `Sanity document ${_id} is missing a Stripe Price ID (stripe.stripePriceId).` });
    }

    let stripeProductId;
    try {
      const price = await stripe.prices.retrieve(stripePriceId);
      stripeProductId = price?.product;
      if (!stripeProductId) {
        throw new Error(`Price ${stripePriceId} not linked to a Product in Stripe.`);
      }
       console.log(`[SYNC-INFO] Found Stripe Product ID: ${stripeProductId}`);
    } catch (err) {
      console.error('[SYNC-ERROR] Stripe price retrieval failed:', { message: err.message });
      return json(404, { error: `Could not find a valid Product for Price ID ${stripePriceId}.` });
    }

    const metadata = {
        sanityId: _id, // Always include the back-reference
        sku: sku || null, // Send null to clear the value in Stripe if it's empty in Sanity
        priceCode: priceCode || null
    };

    const productData = {
      ...(name && { name }), // Only update name if it exists
      metadata,
    };
    
    console.log(`[SYNC-INFO] Preparing to update Stripe Product ${stripeProductId} with data:`, JSON.stringify(productData, null, 2));

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
function verifySanitySignature({ body, secret, signatureHeader, isBase64Encoded }) {
  if (!signatureHeader) throw new Error('Missing X-Sanity-Signature header');
  const raw = isBase64Encoded ? Buffer.from(body, 'base64') : Buffer.from(body, 'utf8');
  const hmac = crypto.createHmac('sha1', secret).update(raw).digest('hex');
  const expected = `sha1=${hmac}`;
  const a = Buffer.from(signatureHeader);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw new Error('Signature mismatch');
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,X-Sanity-Signature',
};

function json(statusCode, obj) {
  return { statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' }, body: JSON.stringify(obj) };
}

function cors(status = 204) {
  return { statusCode: status, headers: corsHeaders, body: '' };
}