// netlify/functions/submission-created.js
const admin = require('firebase-admin');

let serviceAccount;
try {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        throw new Error('Firebase service account key environment variable not set.');
    }
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
} catch (e) {
    console.error('Failed to parse Firebase service account key. Ensure the environment variable is set correctly.', e);
    // This function is defined at module level, so if it fails here,
    // the handler will not be able to operate correctly.
    // We'll let the handler itself deal with the uninitialized admin app.
}

if (admin.apps.length === 0 && serviceAccount) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch(e) {
        console.error('Firebase Admin SDK initialization failed.', e);
        // Initialization failed, admin.apps will still be empty.
    }
}

const db = admin.firestore();

exports.handler = async (event, context) => {
    if (admin.apps.length === 0) {
         console.error('Firebase app is not initialized. Initialization likely failed at module level.');
         return { statusCode: 500, body: JSON.stringify({ error: 'Server configuration error (Firebase init).' }) };
    }

    try {
        const payload = JSON.parse(event.body).payload;

        if (payload.form_name !== 'notify') {
            console.log(`Ignoring submission for form: ${payload.form_name}`);
            return {
                statusCode: 200,
                body: 'Ignoring submission for unrelated form.'
            };
        }

        const email = payload.data.email;
        const firstName = payload.data.firstName; // Get first name
        const lastName = payload.data.lastName;   // Get last name

        if (!email || !firstName || !lastName) {
            const missingFields = [];
            if (!email) missingFields.push('email');
            if (!firstName) missingFields.push('firstName');
            if (!lastName) missingFields.push('lastName');
            console.error(`Missing required fields: ${missingFields.join(', ')} in submission data:`, payload.data);
            return { statusCode: 400, body: JSON.stringify({ error: `Missing required fields: ${missingFields.join(', ')}.` }) };
        }

        console.log(`Received submission for form "${payload.form_name}" with data:`, { firstName, lastName, email });

        const docRef = await db.collection('submissions').add({
            firstName: firstName,
            lastName: lastName,
            email: email,
            submittedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log('Document written to Firestore with ID: ', docRef.id);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: `Submission for ${firstName} <span class="math-inline">\{lastName\} \(</span>{email}) added to Firestore` })
        };

    } catch (error) {
        console.error('Error handling submission:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to process submission.' })
        };
    }
};