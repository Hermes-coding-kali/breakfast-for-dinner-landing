// netlify/functions/handle-purchase.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

exports.handler = async ({ body, headers }) => {
  const sig = headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // --- EXPANDED DATA FETCHING ---
    // Fetch line items and expand the product data to access name, metadata, etc.
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ['data.price.product'],
    });

    // Robustly get shipping details, falling back to customer details if needed.
    const details = session.shipping_details || session.customer_details;
    if (!details || !details.address) {
      console.error('No shipping or customer address found in the session.');
      return { statusCode: 400, body: 'Missing address information.' };
    }
    
    // --- GATHER ALL NECESSARY FULFILLMENT INFO ---
    const address = details.address;
    const formattedAddress = `
      ${details.name}<br>
      ${address.line1}<br>
      ${address.line2 ? address.line2 + '<br>' : ''}
      ${address.city}, ${address.state} ${address.postal_code}<br>
      ${address.country}
    `;

    const customerEmail = session.customer_details.email;
    // Best practice: Collect phone numbers for shipping couriers.
    const customerPhone = session.customer_details.phone || 'Not provided';
    
    // Get the shipping method chosen by the customer.
    const shippingMethod = session.shipping_details?.shipping_rate?.display_name || 'Standard Shipping';

    // Get the order date from the event timestamp and format it.
    const orderDate = new Date(event.created * 1000).toLocaleString('en-US', {
      timeZone: 'America/Vancouver',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    // Create a clean HTML table for the items.
    const itemsTable = lineItems.data.map(item => {
      const metadata = item.price.product.metadata || {};
      const sku = metadata.sku || metadata.isbn || 'N/A';
      // --- GRAB THE PRICE CODE FROM METADATA ---
      const priceCode = metadata.priceCode || 'N/A';
      
      return `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${sku}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${priceCode}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.price.product.name}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        </tr>
      `;
    }).join('');

    try {
      // --- Email to the Owner (unchanged) ---
      await resend.emails.send({
        from: 'Sales <sales@breakfastfordinner.ca>',
        to: ['br3akfast.f0r.dinn3r@gmail.com'], // Replace with actual owner email if different
        subject: `New Sale! Order #${session.id.substring(8)}`,
        html: `<h2>You made a new sale!</h2>
               <p><strong>Customer Email:</strong> ${customerEmail}</p>
               <p><strong>Total:</strong> $${(session.amount_total / 100).toFixed(2)}</p>
               <p><strong>Order ID:</strong> ${session.id}</p>`,
      });

      // --- DETAILED FULFILLMENT EMAIL TO THE PUBLISHING COMPANY ---
      await resend.emails.send({
        from: 'New Order <orders@breakfastfordinner.ca>',
        to: ['br3akfast.f0r.dinn3r@gmail.com'], // IMPORTANT: Replace with the publisher's fulfillment email address
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

    } catch (error)      {
      console.error('Error sending email via Resend:', error);
      // Even if emails fail, don't block the Stripe webhook confirmation
      // You can add more robust error handling/retry logic here if needed.
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true }),
  };
};