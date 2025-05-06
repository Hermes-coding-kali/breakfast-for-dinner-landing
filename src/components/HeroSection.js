// src/components/HeroSection.js
import React, { useEffect, useState } from 'react'; // Import useEffect and useState
import './HeroSection.css';

function HeroSection() {
  // State to store header height - needed to calculate scroll offset
  const [headerHeight, setHeaderHeight] = useState(0);

  // Effect to measure header height after component mounts and on resize
  useEffect(() => {
    const headerElement = document.getElementById('main-header');
    if (headerElement) {
      const updateHeight = () => {
        setHeaderHeight(headerElement.offsetHeight);
      };
      updateHeight(); // Initial measurement
      window.addEventListener('resize', updateHeight);
      return () => window.removeEventListener('resize', updateHeight); // Cleanup
    }
  }, []); // Runs once on mount

  // Function to handle smooth scroll to the CTA section
  const handleScrollToCta = (event) => {
    event.preventDefault(); // Good practice, though it's a button not an anchor

    const targetElement = document.getElementById('cta'); // Target the CallToAction section

    if (targetElement) {
      // Calculate position to scroll to, subtracting header height
      const targetPosition = targetElement.offsetTop - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth' // Enable smooth scrolling
      });
    }
  };

  return (
    // Keep the fun-hero class
    <section id="hero" className="hero-section fun-hero">
      <h1 className="main-title book-title-approx">
        <span className="title-breakfast">BREAKFAST</span>
        <br />
        <span className="title-for">FOR</span>
        <br />
        <span className="title-dinner">DINNER</span>
      </h1>

      {/* Placeholder for a main illustration */}
      <div className="illustration-placeholder hero-main-illustration">
         Main Illustration Placeholder
      </div>

      {/* Primary call to action - Add onClick handler */}
      <button
        className="cta-button button-orange hero-cta-button"
        onClick={handleScrollToCta} // Add the click handler here
      >
        Find Out More!
      </button>

      {/* REMOVED the wavy border div that was here */}
      {/* <div className="wavy-border"></div> */}
    </section>
  );
}

export default HeroSection;
