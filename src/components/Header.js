// src/components/Header.js
import React, { useState } from 'react'; // Import useState
import './Header.css';

function Header() {
  // State to manage mobile menu visibility
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    // Changed class slightly for clarity, added id
    <header id="main-header" className="app-header fixed-header">
      {/* Title */}
      <div className="header-title">
         {/* Link title back to top - also closes menu */}
         <a href="#hero" onClick={closeMenu}>Breakfast for Dinner</a>
      </div>

      {/* Hamburger Button - shown only on mobile via CSS */}
      <button
        className="hamburger-button"
        onClick={toggleMenu}
        aria-label="Toggle menu"
        aria-expanded={isOpen} // For accessibility
      >
        {/* Simple spans for burger lines */}
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Navigation Links - add conditional class */}
      <nav className={`header-nav ${isOpen ? 'mobile-open' : ''}`}>
        <ul>
          {/* Add onClick to close menu when link is clicked */}
          <li><a href="#about" onClick={closeMenu}>About</a></li>
          <li><a href="#cta" onClick={closeMenu}>Sign Up</a></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;