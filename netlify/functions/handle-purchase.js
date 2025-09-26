// netlify/functions/handle-purchase.js
/* eslint-disable no-console */
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Resend } = require('resend');
const { createClient } = require('@sanity/client');

// ---------- Env & setup ----------
const REQUIRED_ENV = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'RESEND_API_KEY',
  'SANITY_PROJECT_ID',
  'SANITY_DATASET',
];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
  console.warn('Missing env vars (some may be optional in production):', missing.join(', '));
}

const resend = new Resend(process.env.RESEND_API_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// FROM (must be a verified Resend domain/address)
const RESEND_FROM_OWNER = process.env.RESEND_FROM_OWNER || 'Sales <sales@breakfastfordinner.ca>';
const RESEND_FROM_FULFILLMENT =
  process.env.RESEND_FROM_FULFILLMENT || 'New Order <orders@breakfastfordinner.ca>';

// TO (comma-separated lists)
function list(val) {
  return (val || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
const OWNER_TO = list(process.env.OWNER_TO || 'hermes.kali.music@gmail.com'); // internal notify list
const FULFILLMENT_TO = list(process.env.FULFILLMENT_TO || 'mayahermeskali@gmail.com'); // warehouse/partner

// Optional reply-to (e.g., your support inbox)
const REPLY_TO = list(process.env.REPLY_TO || 'support@breakfastfordinner.ca');

const SANITY_API_VERSION = process.env.SANITY_API_VERSION || '2024-08-14';
const sanity = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: SANITY_API_VERSION,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN, // optional if public
});

// ---------- Helpers ----------
function getRawBody(event) {
  return event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf8')
    : event.body;
}

function money(amount, currency = 'cad', locale = 'en-CA') { // ⭐️ UPDATED DEFAULT
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase(),
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 2,
    }).format((amount || 0) / 100);
  } catch {
    return `$${((amount || 0) / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}

function formatDateFromUnix(unix, tz = 'America/Vancouver', locale = 'en-CA') {
  return new Date(unix * 1000).toLocaleString(locale, {
    timeZone: tz,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

function formatAddress(details) {
  if (!details?.address) return 'Address not provided';
  const a = details.address;
  const line3 =
    [a.city, a.state, a.postal_code].filter(Boolean).join(' ') || '';
  return [
    details.name,
    a.line1,
    a.line2,
    line3,
    a.country,
  ]
    .filter(Boolean)
    .join('<br>');
}

// Prefer Product metadata; fallback to Price; fallback to Sanity via backref; last resort "N/A"
async function deriveSkuAndPriceCode(item) {
  const pMeta = item?.price?.product?.metadata || {};
  const priceMeta = item?.price?.metadata || {};
  let sku = pMeta.sku || pMeta.isbn || priceMeta.sku || priceMeta.isbn;
  let priceCode = pMeta.priceCode || pMeta.priceCode;
  if (sku && priceCode) return { sku, priceCode, source: 'stripe' };

  const sanityId = pMeta.sanityId || priceMeta.sanityId;
  if (sanityId) {
    try {
      const doc = await sanity.getDocument(sanityId);
      if (doc) {
        sku = sku || doc.sku || doc.isbn;
        priceCode = priceCode || doc.priceCode;
        if (sku || priceCode) return { sku: sku || 'N/A', priceCode: priceCode || 'N/A', source: 'sanity' };
      }
    } catch (e) {
      console.warn('Sanity fallback failed', { sanityId, message: e.message });
    }
  }
  return { sku: sku || 'N/A', priceCode: priceCode || 'N/A', source: 'none' };
}

async function buildItemsTableRows(lineItems) {
  const rows = await Promise.all(
    lineItems.data.map(async (item) => {
      const { sku, priceCode } = await deriveSkuAndPriceCode(item);
      const name = item?.price?.product?.name || item.description || 'Item';
      const qty = item.quantity || 1;
      return `
        <tr>
          <td style="padding:8px;border:1px solid #ddd;">${sku}</td>
          <td style="padding:8px;border:1px solid #ddd;">${priceCode}</td>
          <td style="padding:8px;border:1px solid #ddd;">${name}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:center;">${qty}</td>
        </tr>`;
    })
  );
  return rows.join('');
}

// ---------- Handler ----------
exports.handler = async (event) => {
  // Stripe signature verification needs the raw body
  const rawBody = getRawBody(event);
  const sig = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    console.error('Stripe signature verification failed:', err.message);
    return { statusCode: 400, body: JSON.stringify({ error: `Webhook Error: ${err.message}` }) };
  }

  if (stripeEvent.type !== 'checkout.session.completed') {
    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  }

  const session = stripeEvent.data.object;

  try {
    // Expand both price and product so metadata is always available
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ['data.price', 'data.price.product'],
    });

    const details = session.shipping_details || session.customer_details;
    if (!details?.address) {
      console.error('Missing shipping/customer address on session:', { sessionId: session.id });
      return { statusCode: 200, body: JSON.stringify({ received: true, warning: 'Missing address' }) };
    }

    const formattedAddress = formatAddress(details);
    const customerEmail = session.customer_details?.email || 'Not provided';
    const customerPhone = session.customer_details?.phone || 'Not provided';
    const shippingMethod = session.shipping_details?.shipping_rate?.display_name || 'Standard Shipping';
    const orderDate = formatDateFromUnix(stripeEvent.created);
    const currency = (session.currency || 'cad').toUpperCase(); // ⭐️ UPDATED DEFAULT
    const totalFormatted = money(session.amount_total, currency);
    const subtotalFormatted = money(session.amount_subtotal, currency);
    const shippingTotal = session.total_details?.amount_shipping || 0;
    const shippingFormatted = money(shippingTotal, currency);
    const taxTotal = session.total_details?.amount_tax || 0;
    const taxFormatted = money(taxTotal, currency);

    const itemsTable = await buildItemsTableRows(lineItems);

    // ---------- Email Content ----------
    const fullDetailSubject = `New Order • ${session.id.slice(-8)} • ${totalFormatted}`;
    const fullDetailHtml = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.6">
        <h1 style="margin:0 0 12px">New Order Received</h1>
        <p>Please ship the following items.</p>

        <h2 style="margin:16px 0 8px">Order Details</h2>
        <p><strong>Order ID:</strong> ${session.id.slice(-8)}<br>
           <strong>Date:</strong> ${orderDate}<br>
           <strong>Subtotal:</strong> ${subtotalFormatted}<br>
           <strong>Shipping:</strong> ${shippingFormatted}<br>
           <strong>Tax:</strong> ${taxFormatted}<br>
           <strong>Total:</strong> ${totalFormatted}</p>

        <h2 style="margin:16px 0 8px">Ship To</h2>
        <p>${formattedAddress}</p>

        <h2 style="margin:16px 0 8px">Customer Contact</h2>
        <p><strong>Email:</strong> ${customerEmail}<br>
           <strong>Phone:</strong> ${customerPhone}</p>

        <h2 style="margin:16px 0 8px">Shipping Method</h2>
        <p>${shippingMethod}</p>

        <h2 style="margin:16px 0 8px">Items</h2>
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr>
              <th style="padding:8px;border:1px solid #ddd;text-align:left;background:#f8f8f8">SKU / ISBN</th>
              <th style="padding:8px;border:1px solid #ddd;text-align:left;background:#f8f8f8">Price Code</th>
              <th style="padding:8px;border:1px solid #ddd;text-align:left;background:#f8f8f8">Product</th>
              <th style="padding:8px;border:1px solid #ddd;text-align:center;background:#f8f8f8">Qty</th>
            </tr>
          </thead>
          <tbody>
            ${itemsTable}
          </tbody>
        </table>

        <p style="margin-top:20px;color:#6b7280;font-size:12px">
          This is an automated message. Full Stripe Session ID: ${session.id}
        </p>
      </div>
    `;
    const fullDetailText = [
      `New Order to Fulfill`,
      `Order: ${session.id}`,
      `Date: ${orderDate}`,
      `Subtotal: ${subtotalFormatted}`,
      `Shipping: ${shippingFormatted}`,
      `Tax: ${taxFormatted}`,
      `Total: ${totalFormatted}`,
      `Ship To:`,
      details.name,
      details.address?.line1,
      details.address?.line2,
      `${details.address?.city}, ${details.address?.state} ${details.address?.postal_code}`,
      details.address?.country,
      `Customer: ${customerEmail} (${customerPhone})`,
      `Shipping Method: ${shippingMethod}`,
      `Items: see HTML version for table`,
    ].filter(Boolean).join('\n');

    // --- Send emails ---
    try {
      await resend.emails.send({
        from: RESEND_FROM_OWNER,
        to: OWNER_TO,
        reply_to: REPLY_TO,
        subject: fullDetailSubject,
        html: fullDetailHtml,
        text: fullDetailText,
      });
    } catch (e) {
      console.error('Owner email failed:', e?.message || e);
    }

    try {
      await resend.emails.send({
        from: RESEND_FROM_FULFILLMENT,
        to: FULFILLMENT_TO,
        reply_to: REPLY_TO,
        subject: fullDetailSubject,
        html: fullDetailHtml,
        text: fullDetailText,
      });
    } catch (e) {
      console.error('Fulfillment email failed:', e?.message || e);
    }

    // Debug snapshot
    console.log(
      JSON.stringify(
        {
          msg: 'checkout.session.completed processed',
          sessionId: session.id,
          ownerTo: OWNER_TO,
          fulfillmentTo: FULFILLMENT_TO,
          lineItems: lineItems.data.map((li) => ({
            productId: li?.price?.product?.id,
            priceId: li?.price?.id,
            hasProductMeta: !!Object.keys(li?.price?.product?.metadata || {}).length,
            hasPriceMeta: !!Object.keys(li?.price?.metadata || {}).length,
          })),
        },
        null,
        2
      )
    );
  } catch (err) {
    console.error('Webhook handling error:', {
      message: err?.message,
      code: err?.code,
      stack: err?.stack?.split('\n')?.[0],
    });
    return { statusCode: 200, body: JSON.stringify({ received: true, warning: 'Handler error logged' }) };
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};