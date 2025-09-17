// src/components/HeroSection.js
import React from 'react';
import { useLocation } from 'react-router-dom';
import './HeroSection.css';
import Button from './Button';
import { scrollToId } from '../utils/scrollToId';

// Helper: choose HTML tag dynamically
function Heading({ as: Tag = 'h1', className, children, ...rest }) {
  return <Tag className={className} {...rest}>{children}</Tag>;
}

// Merge base tokens with override tokens (override wins when defined)
function mergeTokens(base, override) {
  const merged = { ...(base || {}) };
  if (override && typeof override === 'object') {
    for (const [k, v] of Object.entries(override)) {
      if (v !== undefined && v !== null && v !== '') merged[k] = v;
    }
  }
  return merged;
}

// Accept `headerHeight` prop
function HeroSection({ data, headerHeight = 0 }) {
  const location = useLocation();
  const {
    eyebrow,
    titleLine1,
    titleLine2,
    titleLine3,
    subtitle,
    image,
    imageAlt,
    buttons = [],
    alignment = 'center',
    imagePosition = 'right',
    headingLevel = 'h1',
    backgroundAngle = 180,
    backgroundColorStart,
    backgroundColorEnd,
    overlayOpacity = 0,
    titleLine1Color,
    titleLine2Color,
    titleLine3Color,
  } = data || {};

  // Add this click handler
  const handleButtonClick = (event, href) => {
    const isHome = location.pathname === '/';
    const isAnchorLink = href && href.startsWith('/#');

    if (isHome && isAnchorLink) {
      event.preventDefault();
      const targetId = href.split('#')[1];
      scrollToId(targetId, headerHeight);

      // Manually update the URL hash in the address bar without a page reload
      if (window.history.pushState) {
        window.history.pushState(null, '', `/#${targetId}`);
      }
    }
    // For all other links (external, different pages), let the Button component handle it.
  };

  const styleVars = {
    '--hero-bg-angle': `${backgroundAngle}deg`,
    '--hero-bg-start': backgroundColorStart || '#2196f3',
    '--hero-bg-end': backgroundColorEnd || '#42a5f5',
    '--hero-overlay-opacity': overlayOpacity,
  };

  const HeadingTag = ['h1', 'h2', 'h3'].includes(headingLevel) ? headingLevel : 'h1';

  return (
    <section
      id="hero"
      className={`hero-section align-${alignment} img-${imagePosition}`}
      style={styleVars}
      aria-label="Hero"
    >
      <div className="hero-bg-overlay" aria-hidden="true" />
      <div className="hero-inner">
        {eyebrow && <p className="hero-eyebrow">{eyebrow}</p>}

        {(titleLine1 || titleLine2 || titleLine3) && (
          <Heading as={HeadingTag} className="main-title book-title-approx">
            {titleLine1 && <span style={{ color: titleLine1Color || 'var(--title-yellow)' }}>{titleLine1}</span>}
            {titleLine2 && <span style={{ color: titleLine2Color || 'var(--title-orange)' }}>{titleLine2}</span>}
            {titleLine3 && <span style={{ color: titleLine3Color || 'var(--title-red-orange)' }}>{titleLine3}</span>}
          </Heading>
        )}

        {subtitle && <p className="hero-subtitle">{subtitle}</p>}

        <div className="hero-main-illustration-container">
          {image?.asset?.url && (
            <img
              src={image.asset.url}
              alt={imageAlt || 'Hero image'}
              className="hero-main-illustration"
              width={image.asset.metadata?.dimensions?.width || undefined}
              height={image.asset.metadata?.dimensions?.height || undefined}
              loading="eager"
              decoding="async"
              sizes="(max-width: 768px) 90vw, 60vw"
            />
          )}
        </div>

        {Array.isArray(buttons) && buttons.length > 0 && (
          <div className="hero-buttons-container">
            {/* Update the button mapping logic */}
            {buttons.map((b) => {
              const tokens = mergeTokens(b?.style, b?.override);
              const href = b?.link?.href;
              const isExternal = href && /^https?:\/\//i.test(href);
              const isAnchor = href && href.includes('/#');
              const target = b?.link?.openInNewTab || isExternal ? '_blank' : undefined;
              
              return (
                <Button
                  key={b?._key || b?.label}
                  to={!isExternal && !isAnchor && href ? href : undefined}
                  href={isExternal || isAnchor ? href : undefined}
                  target={target}
                  onClick={(e) => handleButtonClick(e, href)}
                  aria-label={b?.link?.ariaLabel || undefined}
                  styleTokens={tokens}
                >
                  {b?.label || 'Learn more'}
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default HeroSection;