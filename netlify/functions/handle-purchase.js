// netlify/functions/handle-purchase.js
/* eslint-disable no-console */
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Resend } = require('resend');
const { createClient } = require('@sanity/client');

// ---------- Required envs (fail fast in dev) ----------
const REQUIRED_ENV = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'RESEND_API_KEY',
  'SANITY_PROJECT_ID',
  'SANITY_DATASET',
  // SANITY_API_TOKEN optional if your fields are public; used for fallback
];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
  console.warn('Missing env vars (some may be optional in production):', missing.join(', '));
}

const resend = new Resend(process.env.RESEND_API_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Optional envs for recipients + Sanity
const OWNER_EMAIL = process.env.OWNER_EMAIL || 'sales@breakfastfordinner.ca';
const FULFILLMENT_EMAIL = process.env.FULFILLMENT_EMAIL || 'orders@breakfastfordinner.ca';
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
  // Netlify passes string; for Stripe verification we must use the *raw* body.
  // If isBase64Encoded, decode to a Buffer and then back to UTF-8 string.
  return event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf8')
    : event.body;
}

function usd(amount, currency = 'usd', locale = 'en-CA') {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.toUpperCase(),
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 2,
    }).format((amount || 0) / 100);
  } catch {
    // Fallback
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
  const lines = [
    details.name,
    a.line1,
    a.line2,
    `${a.city || ''}${a.city && (a.state || a.postal_code) ? ',' : ''} ${a.state || ''} ${a.postal_code || ''}`.trim(),
    a.country,
  ].filter(Boolean);
  return lines.join('<br>');
}

// Prefer Product metadata; fallback to Price; fallback to Sanity via backref; last resort "N/A"
async function deriveSkuAndPriceCode(item) {
  const pMeta = item?.price?.product?.metadata || {};
  const priceMeta = item?.price?.metadata || {};

  let sku = pMeta.sku || pMeta.isbn || priceMeta.sku || priceMeta.isbn;
  let priceCode = pMeta.priceCode || priceMeta.priceCode;

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

// Build HTML rows for items
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
  // Stripe requires the exact raw body string for signature verification
  const rawBody = getRawBody(event);
  const sig = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    console.error('Stripe signature verification failed:', err.message);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Webhook Error: ${err.message}` }),
    };
  }

  // We only care about completed checkouts
  if (stripeEvent.type !== 'checkout.session.completed') {
    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  }

  const session = stripeEvent.data.object;

  try {
    // Expand BOTH price and product so metadata is always accessible
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ['data.price', 'data.price.product'],
    });

    const details = session.shipping_details || session.customer_details;
    if (!details?.address) {
      console.error('Missing shipping/customer address on session:', { sessionId: session.id });
      // Acknowledge to Stripe to avoid retries; log for manual follow-up.
      return { statusCode: 200, body: JSON.stringify({ received: true, warning: 'Missing address' }) };
    }

    const formattedAddress = formatAddress(details);
    const customerEmail = session.customer_details?.email || 'Not provided';
    const customerPhone = session.customer_details?.phone || 'Not provided';
    const shippingMethod = session.shipping_details?.shipping_rate?.display_name || 'Standard Shipping';
    const orderDate = formatDateFromUnix(stripeEvent.created);
    const currency = (session.currency || 'usd').toUpperCase();
    const totalFormatted = usd(session.amount_total, currency);
    const subtotalFormatted = usd(session.amount_subtotal, currency);
    const shippingTotal = session.total_details?.amount_shipping || 0;
    const shippingFormatted = usd(shippingTotal, currency);
    const taxTotal = session.total_details?.amount_tax || 0;
    const taxFormatted = usd(taxTotal, currency);

    const itemsTable = await buildItemsTableRows(lineItems);

    // ---------- Emails ----------
    // 1) Owner notification (concise)
    const ownerSubject = `New Sale • ${session.id.slice(-8)} • ${totalFormatted}`;
    const ownerHtml = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.5">
        <h2 style="margin:0 0 8px">You made a new sale!</h2>
        <p><strong>Order:</strong> ${session.id}</p>
        <p><strong>Total:</strong> ${totalFormatted}</p>
        <p><strong>Customer:</strong> ${customerEmail}</p>
        <hr style="margin:16px 0">
        <p style="color:#6b7280;font-size:12px">Stripe Checkout • ${orderDate}</p>
      </div>
    `;
    const ownerText = `New sale\nOrder: ${session.id}\nTotal: ${totalFormatted}\nCustomer: ${customerEmail}\nDate: ${orderDate}`;

    // 2) Fulfillment details (SKU / Price Code guaranteed via fallback)
    const fulfillSubject = `New Fulfillment • ${session.id.slice(-8)} • ${totalFormatted}`;
    const fulfillHtml = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.6">
        <h1 style="margin:0 0 12px">New Order to Fulfill</h1>
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
    const fulfillText = [
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
    ]
      .filter(Boolean)
      .join('\n');

    // Fire & forget email sends; webhook should still 200 even if email fails
    try {
      await resend.emails.send({
        from: `Sales <${OWNER_EMAIL}>`,
        to: [OWNER_EMAIL],
        subject: ownerSubject,
        html: ownerHtml,
        text: ownerText,
      });
    } catch (e) {
      console.error('Owner email failed:', e?.message || e);
    }

    try {
      await resend.emails.send({
        from: `New Order <${FULFILLMENT_EMAIL}>`,
        to: [FULFILLMENT_EMAIL],
        subject: fulfillSubject,
        html: fulfillHtml,
        text: fulfillText,
      });
    } catch (e) {
      console.error('Fulfillment email failed:', e?.message || e);
    }

    // Helpful debug (visible in Netlify logs)
    console.log(
      JSON.stringify(
        {
          msg: 'checkout.session.completed processed',
          sessionId: session.id,
          lineItems: lineItems.data.map((li) => ({
            productId: li?.price?.product?.id,
            priceId: li?.price?.id,
            // Show a snapshot of metadata presence for troubleshooting
            hasProductMeta: !!Object.keys(li?.price?.product?.metadata || {}).length,
            hasPriceMeta: !!Object.keys(li?.price?.metadata || {}).length,
          })),
        },
        null,
        2
      )
    );
  } catch (err) {
    // Don’t cause Stripe retries unless you *need* them.
    console.error('Webhook handling error:', {
      message: err?.message,
      code: err?.code,
      stack: err?.stack?.split('\n')?.[0],
    });
    return { statusCode: 200, body: JSON.stringify({ received: true, warning: 'Handler error logged' }) };
  }

  // Always acknowledge to Stripe
  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
