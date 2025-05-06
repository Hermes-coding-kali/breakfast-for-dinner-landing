// netlify/functions/submission-created.js
// --- START COPY ---
const admin = require('firebase-admin');

// Securely load Firebase credentials from environment variables
// Ensure FIREBASE_SERVICE_ACCOUNT_KEY is set in Netlify UI
let serviceAccount;
try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        throw new Error('Firebase service account key environment variable not set.');
    }
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
} catch (e) {
    console.error('Failed to parse Firebase service account key. Ensure the environment variable is set correctly.', e);
    // Return a 500 error but prevent detailed credentials leakage
    return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server configuration error.' })
    };
}


// Initialize Firebase Admin SDK only once per container instance
if (admin.apps.length === 0) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch(e) {
        console.error('Firebase Admin SDK initialization failed.', e);
        // Return a 500 error but prevent detailed credentials leakage
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Server configuration error.' })
        };
    }
}

const db = admin.firestore();

exports.handler = async (event, context) => {
    // Check if Firebase was initialized successfully in this execution context
    // This handles cases where initialization might fail due to env var issues
    // across different cold starts, although the initial check should catch most.
    if (admin.apps.length === 0) {
         console.error('Firebase app is not initialized. Initialization likely failed earlier.');
         return { statusCode: 500, body: JSON.stringify({ error: 'Server configuration error.' }) };
    }

    try {
        // Netlify passes submission data in the event body
        const payload = JSON.parse(event.body).payload;

        // --- IMPORTANT: Match 'notify' with your form's name attribute ---
        if (payload.form_name !== 'notify') {
            // Not the form we're interested in, exit gracefully
            console.log(`Ignoring submission for form: ${payload.form_name}`);
            return {
                statusCode: 200, // Still a success, just ignored
                body: 'Ignoring submission for unrelated form.'
            };
        }

        const email = payload.data.email; // Get email from form data

        if (!email) {
            console.error('Email not found in submission data:', payload.data);
            return { statusCode: 400, body: JSON.stringify({ error: 'Email not found in submission.' }) };
        }

        console.log(`Received submission for form "${payload.form_name}" with email: ${email}`);

        // Add a new document with a generated ID to the "submissions" collection
        const docRef = await db.collection('submissions').add({
            email: email,
            submittedAt: admin.firestore.FieldValue.serverTimestamp() // Optional: add a timestamp
        });

        console.log('Document written to Firestore with ID: ', docRef.id);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: `Email ${email} added to Firestore` })
        };

    } catch (error) {
        console.error('Error handling submission:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to process submission.' })
        };
    }
};
// --- END COPY ---