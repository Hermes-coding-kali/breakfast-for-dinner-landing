// src/components/Header.js
import React, { useState, useEffect } from 'react'; // Import useEffect
import './Header.css';

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0); // State to store header height

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Function to close menu AND handle smooth scroll
  const handleNavClick = (event) => {
    event.preventDefault(); // Prevent default anchor jump
    setIsOpen(false); // Close mobile menu if open

    const targetId = event.currentTarget.getAttribute('href').substring(1); // Get target id ('about', 'cta', 'hero', 'food-sort-game')
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      // Calculate position to scroll to, subtracting header height
      const targetPosition = targetElement.offsetTop - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth' // Enable smooth scrolling
      });
    }
  };

  // Effect to measure header height after component mounts and on resize
  useEffect(() => {
    const headerElement = document.getElementById('main-header');
    if (headerElement) {
      // Function to update header height
      const updateHeight = () => {
        setHeaderHeight(headerElement.offsetHeight);
      };

      // Initial measurement
      updateHeight();

      // Measure on resize
      window.addEventListener('resize', updateHeight);

      // Cleanup listener on component unmount
      return () => window.removeEventListener('resize', updateHeight);
    }
  }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

  return (
    // Changed class slightly for clarity, added id
    <header id="main-header" className="app-header fixed-header">
      {/* Title */}
      <div className="header-title">
         {/* Link title back to top - also uses smooth scroll */}
         <a href="#hero" onClick={handleNavClick}>Breakfast for Dinner</a>
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
          {/* Add onClick handler for smooth scroll */}
          <li><a href="#about" onClick={handleNavClick}>About</a></li>
          {/* Add the link to the Food Sort Game section */}
          <li><a href="#cta" onClick={handleNavClick}>Sign Up</a></li>
          <li><a href="#food-sort-game" onClick={handleNavClick}>Game</a></li> {/* <-- ADDED THIS LINE */}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
