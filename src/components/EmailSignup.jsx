// src/components/EmailSignup.jsx
import React, {useRef, useState} from 'react'
import Button from './Button'
import './EmailSignup.css' // ← layout-only CSS (names row + email below)

function hx(c) {
  // accepts: "#fff" | {hex:"#ffffff"} | undefined
  return typeof c === 'string' ? c : c?.hex || undefined
}

export default function EmailSignup({data}) {
  const {
    // CONTENT
    heading,
    subheading,
    privacyNote,

    // FORM
    formName = 'notify',
    showNameFields,
    firstNamePlaceholder = 'First name',
    lastNamePlaceholder = 'Last name',
    emailPlaceholder = 'you@example.com',
    enableHoneypot = true,
    honeypotFieldName = 'bot-field',
    successMessage = 'Thanks! Please check your inbox.',
    errorMessage = 'Oops—something went wrong. Please try again.',
    successRedirect,

    // FORM input styling
    inputBorderColor,
    inputBorderWidth = 3,
    inputBorderRadius = 25,
    inputPaddingY = 12,
    inputPaddingX = 20,
    inputFontFamily = 'Baloo 2',
    inputFontSize = 1.05,
    inputInsetShadow = 'inset 2px 2px 3px rgba(0,0,0,0.2)',
    formGap = 15, // still respected via inline 'gap' on the form

    // LAYOUT
    paddingY = 80,
    paddingX = 20,
    formMaxWidth = 550,

    // SECTION & HEADING STYLING
    bgAngle = 180,
    bgColorStart,
    bgColorEnd,
    headingFontFamily = 'Lilita One',
    headingFontSize = 2.5,
    headingLetterSpacing = 0.5,
    headingFillColor,
    headingStrokeColor,
    headingStrokeWidth = 2,
    headingTextShadow = '2px 2px 0px rgba(0,0,0,0.15)',

    // DECORATIVE BLOB
    blobColor,
    blobBorderColor,
    blobBorderWidth = 3,
    blobOpacity = 0.7,
    blobSize = {width: 60, height: 60},
    blobPosition = {top: 10, right: 10},
    blobRotation = -25,

    // BUTTON
    buttonLabel = 'Subscribe',
    buttonStyle,        // resolved by query (ref -> tokens)
    buttonOverride,     // partial overrides
    buttonMaxWidth = 320,  // used by CSS (cap width)
    buttonFullWidth = true // used by CSS (stretch)
  } = data || {}

  const [status, setStatus] = useState(null) // {type:'success'|'error', msg:string}
  const [submitting, setSubmitting] = useState(false)
  const emailRef = useRef(null)

  const onSubmit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    const email = (fd.get('email') || '').toString().trim()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus({type: 'error', msg: 'Enter a valid email address.'})
      emailRef.current?.focus()
      return
    }

    setSubmitting(true)
    setStatus(null)

    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({
          'form-name': formName,
          ...Object.fromEntries(fd),
        }).toString(),
      })

      if (res.ok) {
        if (successRedirect) {
          window.location.assign(successRedirect)
          return
        }
        form.reset()
        setStatus({type: 'success', msg: successMessage})
      } else {
        throw new Error('Bad response')
      }
    } catch {
      setStatus({type: 'error', msg: errorMessage})
    } finally {
      setSubmitting(false)
    }
  }

  // ---- dynamic styles (CMS-driven) ----
  const sectionStyle = {
    position: 'relative',
    overflow: 'hidden',
    padding: `${paddingY}px ${paddingX}px ${paddingY + 10}px ${paddingX}px`,
    color: '#fff',
    background: `linear-gradient(${bgAngle}deg, ${hx(bgColorStart) || '#1976d2'} 0%, ${hx(bgColorEnd) || '#4fa8e0'} 100%)`,
  }

  const headingStyle = {
    marginBottom: 30,
    display: 'inline-block',
    position: 'relative',
    fontFamily: headingFontFamily,
    fontWeight: 400,
    fontSize: `${headingFontSize}em`,
    color: hx(headingFillColor) || '#ffeb3b',
    letterSpacing: `${headingLetterSpacing}px`,
    WebkitTextStrokeWidth: `${headingStrokeWidth}px`,
    WebkitTextStrokeColor: hx(headingStrokeColor) || '#212121',
    textShadow: headingTextShadow,
    zIndex: 1,
  }

  const formWrapStyle = {
    position: 'relative',
    zIndex: 1,
    maxWidth: formMaxWidth,
    marginLeft: 'auto',
    marginRight: 'auto',
  }

  // layout (rows/columns) handled by CSS class; keep gap customizable
  const formStyle = { gap: `${formGap}px` }

  const baseInputStyle = {
    padding: `${inputPaddingY}px ${inputPaddingX}px`,
    borderRadius: inputBorderRadius,
    border: `${inputBorderWidth}px solid ${hx(inputBorderColor) || '#8e24aa'}`,
    fontFamily: `${inputFontFamily}, cursive, sans-serif`,
    fontSize: `${inputFontSize}em`,
    boxShadow: inputInsetShadow,
    boxSizing: 'border-box',
  }

  // Merge base button style + overrides into tokens for <Button />
  const tokens = {
    paddingX: buttonOverride?.paddingX ?? buttonStyle?.paddingX,
    paddingY: buttonOverride?.paddingY ?? buttonStyle?.paddingY,
    borderRadius: buttonOverride?.borderRadius ?? buttonStyle?.borderRadius,
    borderWidth: buttonOverride?.borderWidth ?? buttonStyle?.borderWidth,
    textColor: hx(buttonOverride?.textColor) ?? hx(buttonStyle?.textColor) ?? '#111',
    backgroundColor: hx(buttonOverride?.backgroundColor) ?? hx(buttonStyle?.backgroundColor) ?? '#ffd86b',
    borderColor: hx(buttonOverride?.borderColor) ?? hx(buttonStyle?.borderColor) ?? '#212121',
    font: buttonOverride?.font ?? buttonStyle?.font,
    fontWeight: buttonOverride?.fontWeight ?? buttonStyle?.fontWeight,
    fontSize: buttonOverride?.fontSize ?? buttonStyle?.fontSize,
    boxShadow: buttonOverride?.boxShadow ?? buttonStyle?.boxShadow,
    textShadow: buttonOverride?.textShadow ?? buttonStyle?.textShadow,
    // layout helpers for the button (passed so Button can set inline width/maxWidth if you want)
    maxWidth: buttonMaxWidth,
    fullWidth: buttonFullWidth
  }

  // decorative blob (pseudo-element replacement)
  const blobStyle = {
    content: '""',
    position: 'absolute',
    top: `${blobPosition?.top ?? 10}%`,
    right: `${blobPosition?.right ?? 10}%`,
    width: `${blobSize?.width ?? 60}px`,
    height: `${blobSize?.height ?? 60}px`,
    backgroundColor: hx(blobColor) || '#a0d2eb',
    borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
    border: `${blobBorderWidth}px solid ${hx(blobBorderColor) || '#212121'}`,
    opacity: blobOpacity,
    transform: `rotate(${blobRotation}deg)`,
    zIndex: 0,
    pointerEvents: 'none',
  }

  return (
    <section id="cta" style={sectionStyle} aria-labelledby="cta-heading">
      {/* decorative shape */}
      <span aria-hidden="true" style={blobStyle} />

      {heading && <h2 id="cta-heading" style={headingStyle}>{heading}</h2>}
      {subheading && (
        <p style={{position:'relative', zIndex:1, marginTop:-10, marginBottom:20}}>
          {subheading}
        </p>
      )}

      <div style={formWrapStyle}>
        <form
          className="email-signup-form" // ← layout class (CSS controls rows/columns)
          style={formStyle}             // ← keeps your customizable gap
          name={formName}
          method="POST"
          data-netlify="true"
          acceptCharset="UTF-8"
          action={successRedirect || undefined}
          data-netlify-honeypot={enableHoneypot ? honeypotFieldName : undefined}
          onSubmit={onSubmit}
          noValidate
        >
          <input type="hidden" name="form-name" value={formName} />

          {enableHoneypot && (
            <div aria-hidden="true" style={{position:'absolute', left:'-10000px'}}>
              <label>Don’t fill this out: <input name={honeypotFieldName} tabIndex={-1} /></label>
            </div>
          )}

          {showNameFields && (
            <>
              <input
                type="text"
                name="firstName"
                placeholder={firstNamePlaceholder}
                autoComplete="given-name"
                className="name-input"
                style={baseInputStyle}
              />
              <input
                type="text"
                name="lastName"
                placeholder={lastNamePlaceholder}
                autoComplete="family-name"
                className="name-input"
                style={baseInputStyle}
              />
            </>
          )}

          {/* <label className="visually-hidden" htmlFor="cta-email"></label> */}
          <input
            id="cta-email"
            type="email"
            name="email"
            placeholder={emailPlaceholder}
            required
            className="email-input"
            style={baseInputStyle}
            ref={emailRef}
            autoComplete="email"
            inputMode="email"
          />

          <Button
            type="submit"
            disabled={submitting}
            styleTokens={tokens}
            className="submit-button" // ← CSS centers & caps width
          >
            {submitting ? 'Submitting…' : buttonLabel}
          </Button>
        </form>

        {privacyNote && (
          <p style={{marginTop:12, textAlign:'center', opacity:0.9}}>{privacyNote}</p>
        )}

        <div aria-live="polite" aria-atomic="true" style={{minHeight:'1.2em', marginTop:10, textAlign:'center'}}>
          {status && (
            <span style={{color: status.type === 'success' ? '#0f5132' : '#842029'}}>
              {status.msg}
            </span>
          )}
        </div>
      </div>
    </section>
  )
}
