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

    // --- NEW: Fetch line items from the session ---
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ['data.price.product'], // This expands the product details
    });

    // --- Format the shipping address and line items ---
    const shippingDetails = session.shipping_details;
    const address = shippingDetails.address;
    const formattedAddress = `
      ${shippingDetails.name}<br>
      ${address.line1}<br>
      ${address.line2 ? address.line2 + '<br>' : ''}
      ${address.city}, ${address.state} ${address.postal_code}<br>
      ${address.country}
    `;

    const itemsPurchased = lineItems.data.map(item => `
      <li>
        <strong>${item.price.product.name}</strong><br>
        Quantity: ${item.quantity}
      </li>
    `).join('');

    const customerEmail = session.customer_details.email;

    try {
      // --- Email to the Owner (Unchanged) ---
      await resend.emails.send({
        from: 'Sales <sales@breakfastfordinner.ca>',
        to: ['mayahermeskali@gmail.com'],
        subject: `New Sale! Order #${session.id.substring(8)}`, // Add a unique ID
        html: `<h2>You made a new sale!</h2>
               <p><strong>Customer Email:</strong> ${customerEmail}</p>
               <p><strong>Total:</strong> $${(session.amount_total / 100).toFixed(2)}</p>
               <p><strong>Order ID:</strong> ${session.id}</p>`,
      });

      // --- NEW: Detailed Email to the Publishing Company ---
      await resend.emails.send({
        from: 'New Order <orders@breakfastfordinner.ca>',
        to: ['hermes.kali.music@gmail.com'],
        subject: `New Order Notification - Please Ship (Order #${session.id.substring(8)})`,
        html: `
          <h1>New Order to Fulfill</h1>
          <p>A new book order has been placed and requires shipment. Please see the details below.</p>
          
          <h2>Shipping Address:</h2>
          <p>
            ${formattedAddress}
          </p>
          
          <h2>Customer Contact:</h2>
          <p>${customerEmail}</p>
          
          <h2>Items to Ship:</h2>
          <ul>
            ${itemsPurchased}
          </ul>

          <p><strong>Stripe Order ID:</strong> ${session.id}</p>
        `,
      });

      console.log('Internal sale notification emails sent successfully via Resend.');

    } catch (error) {
      console.error('Error sending email via Resend:', error);
      return { statusCode: 500, body: 'Error sending internal emails.' };
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true }),
  };
};