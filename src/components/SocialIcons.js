// src/components/SocialIcons.js
import React from 'react';

const shared = {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const Instagram = () => (
  <svg {...shared}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);
export const Twitter = () => (
  <svg {...shared}><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
);
export const Facebook = () => (
  <svg {...shared}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);
export const Youtube = () => (
  <svg {...shared}><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 11.75a29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
);
export const Pinterest = () => (
  <svg {...shared}><path d="M21.14 11.82c-.37-1.22-.73-2.45-1.1-3.67-.37-1.22-1.1-2.07-2.22-2.45a7.1 7.1 0 0 0-2.22-.37c-1.22 0-2.45.37-3.67 1.1a4.8 4.8 0 0 0-2.22 2.59c-.37 1.22-.37 2.45-.37 3.67s0 2.45.37 3.67a4.2 4.2 0 0 0 2.22 2.59c1.22.73 2.45 1.1 3.67 1.1a6.5 6.5 0 0 0 5.18-2.22c.73-1.1 1.1-2.45 1.1-3.67a10.8 10.8 0 0 0-.37-2.59z"></path><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"></path></svg>
);
export const Tiktok = () => (
  <svg {...shared}><path d="M12 12a4 4 0 1 0 4 4v-1.28a4 4 0 1 0-4-4zm0-8a4 4 0 1 0 4 4v-1.28a4 4 0 1 0-4-4z"></path></svg>
);