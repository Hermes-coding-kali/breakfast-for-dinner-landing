// src/components/CallToAction.js
import React from 'react';
import './CallToAction.css';

function CallToAction() {
  return (
    <section className="cta-section">
      <h2>Want to know when it's ready?</h2>
      {/* Replace placeholder paragraph with Lorem Ipsum */}
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      </p>
      {/* Keep the form as is */}
      <form name="notify" netlify /* Add netlify attribute for Netlify Forms */ >
         <input type="email" name="email" placeholder="Your Email Address" required className="email-input"/>
         <button type="submit" className="cta-button button-purple">Notify Me!</button>
      </form>
       {/* Placeholder */}
       <div className="illustration-placeholder cta-illustration">
            {/* Update placeholder text */}
            Illustration Placeholder
        </div>
    </section>
  );
}

export default CallToAction;