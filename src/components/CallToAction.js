// src/components/CallToAction.js
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
        {/* Add method="POST" to the form tag */}
        <form name="notify" netlify method="POST">
          <input
            type="text"
            name="firstName"
            placeholder="Your First Name"
            required
            className="name-input"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Your Last Name"
            required
            className="name-input"
          />
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