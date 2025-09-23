// src/components/ScrollToTopButton.js
import React, { useState, useEffect } from 'react';
import './ScrollToTopButton.css'; // We'll create this CSS file next

function ScrollToTopButton() {
  // State to track whether the button should be visible
  const [isVisible, setIsVisible] = useState(false);

  // Function to detect scroll position
  const toggleVisibility = () => {
    // Show button if page is scrolled down more than (e.g.) 300 pixels
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    } 
  };

  // Function to scroll smoothly to the top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Enable smooth scrolling
    });
  };

  // Add scroll event listener when the component mounts
  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount and cleanup on unmount

  return (
    <div className="scroll-to-top">
      {/* Render the button only if isVisible is true */}
      {isVisible && (
        <button onClick={scrollToTop} className="scroll-button" aria-label="Scroll to top">
          {/* You can replace this with an icon (e.g., SVG or from a library) */}
          ⬆️
          {/* Or use a simple caret: ^ */}
        </button>
      )}
    </div>
  );
}

export default ScrollToTopButton;
