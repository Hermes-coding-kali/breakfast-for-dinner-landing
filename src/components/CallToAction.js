// src/components/CallToAction.js
import React, { useState, useRef } from 'react';
import './CallToAction.css';
import Button from './Button';

function CallToAction({ data }) {
  const {
    heading,
    subheading,
    formName = 'notify',
    emailPlaceholder = 'you@example.com',
    buttonLabel = 'Subscribe',
    privacyNote,
    enableHoneypot = true,
    honeypotFieldName = 'bot-field',
    successMessage = 'Thanks! Please check your inbox.',
    errorMessage = 'Oops—something went wrong. Please try again.',
    successRedirect, // optional absolute URL
  } = data || {};

  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [submitting, setSubmitting] = useState(false);
  const emailRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    const email = (fd.get('email') || '').toString().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus({ type: 'error', msg: 'Enter a valid email address.' });
      emailRef.current?.focus();
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          'form-name': formName,
          ...Object.fromEntries(fd),
        }).toString(),
      });

      if (res.ok) {
        if (successRedirect) {
          window.location.assign(successRedirect);
          return;
        }
        form.reset();
        setStatus({ type: 'success', msg: successMessage });
      } else {
        throw new Error('Bad response');
      }
    } catch {
      setStatus({ type: 'error', msg: errorMessage });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="cta" className="cta-section" aria-labelledby="cta-heading">
      {heading && <h2 id="cta-heading">{heading}</h2>}
      {subheading && <p className="cta-subheading">{subheading}</p>}

      <div className="cta-form-container">
        <form
          name={formName}
          method="POST"
          data-netlify="true"
          acceptCharset="UTF-8"
          action={successRedirect || undefined} // works without JS
          data-netlify-honeypot={enableHoneypot ? honeypotFieldName : undefined}
          onSubmit={handleSubmit}
          noValidate
        >
          <input type="hidden" name="form-name" value={formName} />

          {enableHoneypot && (
            <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px' }}>
              <label>
                Don’t fill this out: <input name={honeypotFieldName} tabIndex={-1} />
              </label>
            </div>
          )}

          <label className="visually-hidden" htmlFor="cta-email">
            Email address
          </label>
          <input
            id="cta-email"
            type="email"
            name="email"
            placeholder={emailPlaceholder}
            required
            className="email-input"
            ref={emailRef}
            autoComplete="email"
            inputMode="email"
          />

          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Submitting…' : buttonLabel}
          </Button>
        </form>

        {privacyNote && <p className="privacy-note">{privacyNote}</p>}

        <div
          className="cta-status"
          aria-live="polite"
          aria-atomic="true"
          style={{ minHeight: '1.2em' }}
        >
          {status && (
            <span className={status.type === 'success' ? 'status-success' : 'status-error'}>
              {status.msg}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

export default CallToAction;