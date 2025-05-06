// src/components/CallToAction.js (Option 1)
import React from 'react';
import './CallToAction.css';

function CallToAction() {
  return (
    <section id="cta" className="cta-section">
      <h2>
        Hungry for Updates?
        <br />
        Sign Up Now!
      </h2>

      <div className="cta-form-container">
        {/* Change to data-netlify="true" */}
        <form name="notify" data-netlify="true" method="POST">
          <input
            type="text"
            name="firstName"
            placeholder="Your First Name"
            required
            className="name-input"
          />
          {/* ... other inputs ... */}
          <input
            type="email"
            name="email"
            placeholder="Your Email Address"
            required
            className="email-input"
          />
          <button type="submit" className="cta-button button-purple">Notify Me!</button>
        </form>
      </div>
    </section>
  );
}

export default CallToAction;