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

async function deriveSkuAndPriceCode(item) {
  const pMeta = item?.price?.product?.metadata || {};
  const priceMeta = item?.price?.metadata || {};

  let sku = pMeta.sku || pMeta.isbn || priceMeta.sku || priceMeta.isbn;
  let priceCode = pMeta.priceCode || priceMeta.priceCode;

  if (sku && priceCode) return { sku, priceCode };

  const sanityId = pMeta.sanityId || priceMeta.sanityId;
  if (sanityId) {
    try {
      const doc = await sanity.getDocument(sanityId);
      if (doc) {
        sku = sku || doc.sku || doc.isbn;
        priceCode = priceCode || doc.priceCode;
      }
    } catch (e) {
      console.warn('Sanity fallback failed for', sanityId, e.message);
    }
  }

  return { sku: sku || 'N/A', priceCode: priceCode || 'N/A' };
}

exports.handler = async (event) => {
  const sig = event.headers['stripe-signature'];
  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;

    // Expand both price and product
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ['data.price', 'data.price.product'],
    });

    // TEMP DEBUG: see what metadata is available
    console.log(
      'LineItem metadata snapshot:',
      lineItems.data.map((li) => ({
        productId: li?.price?.product?.id,
        priceId: li?.price?.id,
        productMeta: li?.price?.product?.metadata,
        priceMeta: li?.price?.metadata,
      }))
    );

    const details = session.shipping_details || session.customer_details;
    if (!details || !details.address) {
      console.error('No shipping or customer address found in the session.');
      return { statusCode: 400, body: 'Missing address information.' };
    }

    const address = details.address;
    const formattedAddress = `
      ${details.name}<br>
      ${address.line1}<br>
      ${address.line2 ? address.line2 + '<br>' : ''}
      ${address.city}, ${address.state} ${address.postal_code}<br>
      ${address.country}
    `;

    const customerEmail = session.customer_details.email;
    const customerPhone = session.customer_details.phone || 'Not provided';
    const shippingMethod = session.shipping_details?.shipping_rate?.display_name || 'Standard Shipping';

    const orderDate = new Date(stripeEvent.created * 1000).toLocaleString('en-US', {
      timeZone: 'America/Vancouver',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });

    const itemsTable = (
      await Promise.all(
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
      )
    ).join('');

    try {
      // --- Email to the Owner ---
      await resend.emails.send({
        from: 'Sales <sales@breakfastfordinner.ca>',
        to: ['hermes.kali.music@gmail.com'],
        subject: `New Sale! Order #${session.id.substring(8)}`,
        html: `<h2>You made a new sale!</h2>
               <p><strong>Customer Email:</strong> ${customerEmail}</p>
               <p><strong>Total:</strong> $${(session.amount_total / 100).toFixed(2)}</p>
               <p><strong>Order ID:</strong> ${session.id}</p>`,
      });

      // --- Fulfillment Email ---
      await resend.emails.send({
        from: 'New Order <orders@breakfastfordinner.ca>',
        to: ['mayahermeskali@gmail.com'],
        subject: `New Fulfillment Request - Order #${session.id.substring(8)}`,
        html: `
          <div style="font-family: sans-serif; line-height: 1.6;">
            <h1>New Order to Fulfill</h1>
            <p>Please ship the following items for a new order placed on the website.</p>
            
            <hr>

            <h2>Order Details</h2>
            <p><strong>Order ID:</strong> ${session.id.substring(8)}</p>
            <p><strong>Order Date:</strong> ${orderDate}</p>
            
            <hr>

            <h2>Ship To:</h2>
            <p style="margin-left: 10px;">
              ${formattedAddress}
            </p>
            
            <h2>Customer Contact Information:</h2>
            <p style="margin-left: 10px;">
              <strong>Email:</strong> ${customerEmail}<br>
              <strong>Phone:</strong> ${customerPhone}
            </p>

            <hr>

            <h2>Shipping Method Requested:</h2>
            <p style="margin-left: 10px;">${shippingMethod}</p>

            <hr>

            <h2>Items to Ship:</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr>
                  <th style="padding: 8px; border: 1px solid #ddd; text-align: left; background-color: #f2f2f2;">SKU / ISBN</th>
                  <th style="padding: 8px; border: 1px solid #ddd; text-align: left; background-color: #f2f2f2;">Price Code</th>
                  <th style="padding: 8px; border: 1px solid #ddd; text-align: left; background-color: #f2f2f2;">Product Name</th>
                  <th style="padding: 8px; border: 1px solid #ddd; text-align: center; background-color: #f2f2f2;">Quantity</th>
                </tr>
              </thead>
              <tbody>
                ${itemsTable}
              </tbody>
            </table>
            
            <hr style="margin-top: 25px;">
            <p style="font-size: 0.8em; color: #777;">
              This is an automated message. For reference, the full Stripe Session ID is: ${session.id}
            </p>
          </div>
        `,
      });

      console.log('Fulfillment and notification emails sent successfully.');
    } catch (error) {
      console.error('Error sending email via Resend:', error);
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true }),
  };
};
