// src/components/CallToAction.js
import React from 'react';
import './CallToAction.css';

function CallToAction() {
  return (
    <section id="cta" className="cta-section">
      {/* UPDATED HEADING TEXT with line break */}
      <h2>
        Hungry for Updates?
        <br />
        Sign Up Now!
      </h2>

      {/* Form Container */}
      <div className="cta-form-container">
        <form name="notify" netlify>
           <input type="email" name="email" placeholder="Your Email Address" required className="email-input"/>
           <button type="submit" className="cta-button button-purple">Notify Me!</button>
        </form>
      </div>
    </section>
  );
}

export default CallToAction;