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
        {/*
          Netlify Form Setup:
          - name="notify": Identifies the form in the Netlify UI.
          - method="POST": Standard method for submitting form data.
          - data-netlify="true": Tells Netlify to process this form.
          - Hidden input "form-name": Required by Netlify to correctly identify submissions,
            its value MUST match the form's name attribute.
        */}
        <form
          name="notify"
          method="POST"
          data-netlify="true"
          data-netlify-honeypot="bot-field" // Optional: Basic spam protection
          netlify
        >
          {/* Hidden input for Netlify */}
          <input type="hidden" name="form-name" value="notify" />

          {/* Optional: Honeypot field for spam protection */}
          <p style={{ display: 'none' }}>
            <label>
              Don’t fill this out if you’re human: <input name="bot-field" />
            </label>
          </p>

          {/* Visible Form Fields */}
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
