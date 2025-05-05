// src/components/Header.js
import React from 'react';
import './Header.css'; // Styles for the header

function Header() {
  return (
    <header className="app-header">
      {/* Add the book title */}
      <div className="header-title">Breakfast for Dinner</div>
      {/* You could add a small icon/logo here later if desired */}
    </header>
  );
}

export default Header;