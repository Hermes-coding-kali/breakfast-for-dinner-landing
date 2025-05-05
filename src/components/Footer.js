// src/components/Footer.js
import React from 'react';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();
  // Replace 'Your Friend's Name'
  const authorName = "CoCo";

  return (
    <footer className="app-footer">
      <p>&copy; {currentYear} {authorName}. All Rights Reserved.</p>
      {/* Add any other links if needed */}
    </footer>
  );
}

export default Footer;