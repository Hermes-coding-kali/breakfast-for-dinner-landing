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
        {/* Add method="POST" and data-netlify="true" to the form tag */}
        <form name="contact" netlify> {/* <--- FIX HERE */}
          {/* --- Netlify requires this hidden input for standard forms --- */}
          <input type="hidden" name="form-name" value="notify" />
          {/* ------------------------------------------------------------ */}
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