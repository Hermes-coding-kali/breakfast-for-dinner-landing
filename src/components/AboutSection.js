// src/components/AboutSection.js
import React from 'react';
import './AboutSection.css';

function AboutSection() {
  return (
    <section id="about" className="about-section">
      <div className="bordered-box"> {/* Use the outlined box style */}
        <h2>What's the Book About?</h2>
        {/* Replace placeholder paragraph with Lorem Ipsum */}
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
        </p>
        {/* Placeholder for another illustration */}
        <div className="illustration-placeholder about-illustration">
           {/* Update placeholder text */}
           Illustration Placeholder
        </div>
      </div>
    </section>
  );
}

export default AboutSection;