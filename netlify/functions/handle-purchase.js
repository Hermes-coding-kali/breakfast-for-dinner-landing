// netlify/functions/handle-purchase.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Resend } = require('resend');
const { createClient } = require('@sanity/client');

const resend = new Resend(process.env.RESEND_API_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const sanity = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: process.env.SANITY_API_VERSION || '2024-08-14',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

/**
 * NEW, MORE ROBUST FALLBACK LOGIC
 * Derives SKU and Price Code from a Stripe line item.
 * 1. Tries to get data from Stripe Product metadata (the ideal scenario).
 * 2. If that fails, it uses the Stripe Price ID to query Sanity for the original product.
 */
async function deriveSkuAndPriceCode(item) {
  const productName = item?.price?.product?.name || 'Unknown Product';
  const productMetadata = item?.price?.product?.metadata || {};
  const stripePriceId = item?.price?.id;

  console.log(`[PURCHASE-INFO] Deriving data for "${productName}" (Price ID: ${stripePriceId})`, { productMetadata });

  // 1. Ideal path: Get from Stripe metadata
  let sku = productMetadata.sku;
  let priceCode = productMetadata.priceCode;

  // 2. Fallback path: If data is missing, query Sanity using the reliable Stripe Price ID
  if ((!sku || !priceCode) && stripePriceId) {
    console.warn(`[PURCHASE-WARN] Metadata for "${productName}" is incomplete. Falling back to Sanity using Price ID.`);
    try {
      const query = `*[_type == "product" && stripe.stripePriceId == $stripePriceId][0]`;
      const params = { stripePriceId };
      const doc = await sanity.fetch(query, params);
      
      if (doc) {
        console.log(`[PURCHASE-INFO] Sanity fallback successful. Found SKU: ${doc.sku}, Price Code: ${doc.priceCode}`);
        sku = sku || doc.sku;
        priceCode = priceCode || doc.priceCode;
      } else {
        console.error(`[PURCHASE-ERROR] Sanity fallback failed: No product found with Price ID ${stripePriceId}`);
      }
    } catch (e) {
      console.error(`[PURCHASE-ERROR] Sanity fallback query failed for Price ID ${stripePriceId}`, e.message);
    }
  }

  const result = { sku: sku || 'N/A', priceCode: priceCode || 'N/A' };
  console.log(`[PURCHASE-INFO] Final derived data for "${productName}":`, result);
  return result;
}

// The rest of the handler function remains the same...
exports.handler = async (event) => {
  const sig = event.headers['stripe-signature'];
  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, endpointSecret);
  } catch (err) {
    console.error('[PURCHASE-ERROR] Webhook signature verification failed:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ['data.price.product'],
    });
    
    const details = session.shipping_details || session.customer_details;
    if (!details || !details.address) {
      console.error('No shipping or customer address found in the session.');
      return { statusCode: 400, body: 'Missing address information.' };
    }

    const address = details.address;
    const formattedAddress = `${details.name}<br>${address.line1}<br>${address.line2 ? address.line2 + '<br>' : ''}${address.city}, ${address.state} ${address.postal_code}<br>${address.country}`;
    const customerEmail = session.customer_details.email;
    const customerPhone = session.customer_details.phone || 'Not provided';
    const shippingMethod = session.shipping_details?.shipping_rate?.display_name || 'Standard Shipping';
    const orderDate = new Date(stripeEvent.created * 1000).toLocaleString('en-US', { timeZone: 'America/Vancouver' });

    const itemsTable = (await Promise.all(
      lineItems.data.map(async (item) => {
        const { sku, priceCode } = await deriveSkuAndPriceCode(item);
        return `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">${sku}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${priceCode}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${item.price.product.name}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          </tr>
        `;
      })
    )).join('');

    try {
      // --- Email to the Owner ---
      await resend.emails.send({
        from: 'Sales <sales@breakfastfordinner.ca>',
        to: ['hermes.kali.music@gmail.com'],
        subject: `New Sale! Order #${session.id.substring(8)}`,
        html: `<h2>You made a new sale!</h2><p><strong>Customer Email:</strong> ${customerEmail}</p><p><strong>Total:</strong> $${(session.amount_total / 100).toFixed(2)}</p><p><strong>Order ID:</strong> ${session.id}</p>`,
      });

      // --- Fulfillment Email ---
      await resend.emails.send({
        from: 'New Order <orders@breakfastfordinner.ca>',
        to: ['mayahermeskali@gmail.com'],
        subject: `New Fulfillment Request - Order #${session.id.substring(8)}`,
        html: `<div style="font-family: sans-serif; line-height: 1.6;"><h1>New Order to Fulfill</h1><p>Order ID: ${session.id.substring(8)}</p><p>Order Date: ${orderDate}</p><hr><h2>Ship To:</h2><p style="margin-left: 10px;">${formattedAddress}</p><h2>Customer Contact:</h2><p style="margin-left: 10px;">Email: ${customerEmail}<br>Phone: ${customerPhone}</p><hr><h2>Items:</h2><table style="width: 100%; border-collapse: collapse;"><thead><tr><th style="padding: 8px; border: 1px solid #ddd; text-align: left;">SKU</th><th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Price Code</th><th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Product</th><th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Qty</th></tr></thead><tbody>${itemsTable}</tbody></table></div>`,
      });
    } catch (error) {
      console.error('[PURCHASE-ERROR] Error sending email via Resend:', error);
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};