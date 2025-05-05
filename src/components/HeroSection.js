// src/components/HeroSection.js
import React from 'react';
import './HeroSection.css';

function HeroSection() {
  return (
    <section className="hero-section title-page-style">
      <h1 className="main-title book-title-approx">
        {/* Wrap each word in a span with a class */}
        <span className="title-breakfast">BREAKFAST</span>
        <br />
        <span className="title-for">FOR</span>
        <br />
        <span className="title-dinner">DINNER</span>
      </h1>

      {/* Option 2: SVG/Image Title comment remains unchanged */}
      {/*
        OPTION 2: SVG/Image Title (Recommended for Accuracy)
        If you have the title as an SVG or high-res PNG:
        <img src="/path/to/your/title-image.svg" alt="Breakfast for Dinner" className="title-image" />
        You would need to create this image file separately.
      */}
    </section>
  );
}

export default HeroSection;