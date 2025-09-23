// netlify/functions/handle-purchase.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

exports.handler = async ({ body, headers }) => {
  const sig = headers['stripe-signature'];
  let event;

  try {
    // Verify the event came from Stripe
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  // Handle the 'checkout.session.completed' event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object; 
    const customerEmail = session.customer_details.email;

    try {
      // Email to the Owner
      await resend.emails.send({
        from: 'Sales <sales@breakfastfordinner.ca>', // Use your verified Resend domain
        to: ['br3akfast.f0r.dinn3r@gmail.com'], // Replace with the owner's actual email
        subject: 'New Sale on Breakfast for Dinner!',
        html: `<h2>You made a new sale!</h2><p><strong>Customer Email:</strong> ${customerEmail}</p><p><strong>Total:</strong> $${(session.amount_total / 100).toFixed(2)}</p>`,
      });

      // Email to the Publishing Company
      await resend.emails.send({
        from: 'New Order <orders@breakfastfordinner.ca>', // Use your verified Resend domain
        to: ['hermes.kali.music@gmail.com'], // Replace with the publisher's actual email
        subject: 'New Book Order Received',
        html: `<h2>A new book order has been placed.</h2><p>Please prepare the order for shipment. Details can be found in the sales dashboard.</p>`,
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