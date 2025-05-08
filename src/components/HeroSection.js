// src/components/HeroSection.js
import React, { useEffect, useState } from 'react';
import './HeroSection.css';
import BookwormImage from '../assets/Bookworm.jpg'; // <--- IMPORT YOUR IMAGE

function HeroSection() {
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    const headerElement = document.getElementById('main-header');
    if (headerElement) {
      const updateHeight = () => {
        setHeaderHeight(headerElement.offsetHeight);
      };
      updateHeight();
      window.addEventListener('resize', updateHeight);
      return () => window.removeEventListener('resize', updateHeight);
    }
  }, []);

  const handleScrollToCta = (event) => {
    event.preventDefault();
    const targetElement = document.getElementById('cta');
    if (targetElement) {
      const targetPosition = targetElement.offsetTop - headerHeight;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="hero" className="hero-section fun-hero">
      <h1 className="main-title book-title-approx">
        <span className="title-breakfast">BREAKFAST</span>
        <br />
        <span className="title-for">FOR</span>
        <br />
        <span className="title-dinner">DINNER</span>
      </h1>

      {/* MODIFIED: Use an img tag for the illustration */}
      <div className="hero-main-illustration-container"> {/* Optional: wrapper for better styling control */}
        <img src={BookwormImage} alt="Bookworm illustration" className="hero-main-illustration" />
      </div>

      <button
        className="cta-button button-orange hero-cta-button"
        onClick={handleScrollToCta}
      >
        Find Out More!
      </button>
    </section>
  );
}

export default HeroSection;