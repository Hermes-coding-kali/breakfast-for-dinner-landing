// src/components/HeroSection.js
import React from 'react';
import './HeroSection.css';

function HeroSection() {
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

      {/* Primary call to action */}
      <button className="cta-button button-orange hero-cta-button">
        Find Out More!
      </button>

      {/* REMOVED the wavy border div that was here */}
      {/* <div className="wavy-border"></div> */}
    </section>
  );
}

export default HeroSection;