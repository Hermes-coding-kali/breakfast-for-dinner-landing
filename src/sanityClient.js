// src/sanityClient.js
import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url'; // <-- For processing images

// This is your existing code to fetch data
const client = createClient({
  projectId: '14ptmpdh',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-08-14',
});

// --- THIS IS THE NEW PART ---
// It sets up the helper function to build image URLs
const builder = imageUrlBuilder(client);
export const urlFor = (source) => builder.image(source);
// ----------------------------

export default client;