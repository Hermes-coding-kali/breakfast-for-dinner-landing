// src/components/HeroSection.js
import React from 'react';
import { useLocation } from 'react-router-dom';
import './HeroSection.css';
import Button from './Button';
import { scrollToId } from '../utils/scrollToId';

/** Merge base tokens with override tokens (override wins when defined) */
function mergeTokens(base, override) {
  const merged = { ...(base || {}) };
  if (override && typeof override === 'object') {
    for (const [k, v] of Object.entries(override)) {
      if (v !== undefined && v !== null) merged[k] = v;
    }
  }
  return merged;
}

/** Normalize any href Sanity might send */
function normalizeHref(href) {
  if (!href) return '';
  const h = href.trim();

  // External / protocols we don't touch
  if (/^(https?:|mailto:|tel:)/i.test(h)) return h;

  // Pure hash (e.g. "#about") -> normalize to "/#about"
  if (h.startsWith('#')) return `/${h}`;

  // Already normalized anchor
  if (h.startsWith('/#')) return h;

  // Internal path missing leading slash (e.g. "store") -> "/store"
  if (!h.startsWith('/')) return `/${h}`;

  // "/store" or similar stays
  return h;
}

/** Flexible heading element */
function Heading({ as: Tag = 'h1', className, children, ...rest }) {
  return <Tag className={className} {...rest}>{children}</Tag>;
}

function HeroSection({
  data = {},
  headerHeight = 0, // offset for sticky headers
}) {
  const location = useLocation();

  const {
    titleLine1,
    titleLine2,
    titleLine3,
    titleAs = 'h1',
    subtitle,
    media, // optional image/video object
    buttons = [],
    backgroundAngle = 135,
    backgroundColorStart = '#2196f3',
    backgroundColorEnd = '#42a5f5',
    overlayOpacity = 0,
    titleLine1Color,
    titleLine2Color,
    titleLine3Color,
  } = data;

  const styleVars = {
    '--hero-bg-angle': `${backgroundAngle}deg`,
    '--hero-bg-start': backgroundColorStart,
    '--hero-bg-end': backgroundColorEnd,
    '--hero-overlay-opacity': overlayOpacity,
  };

  const handleAnchorClickOnHome = (e, href) => {
    // Smooth-scroll only when already on "/" and link is an anchor "/#id"
    const isHome = location.pathname === '/';
    const isAnchor = href && href.startsWith('/#');

    if (isHome && isAnchor) {
      e.preventDefault();
      const targetId = href.split('#')[1];
      if (targetId) {
        scrollToId(targetId, headerHeight);
        if (window.history.pushState) window.history.pushState(null, '', href);
      }
    }
  };

  return (
    <section
      className="hero-section"
      style={styleVars}
      aria-label="Hero Section"
    >
      <div className="hero-overlay" />
      <div className="hero-container">
        <div className="hero-text">
          {(titleLine1 || titleLine2 || titleLine3) && (
            <Heading as={titleAs} className="hero-title">
              {titleLine1 && (
                <span style={titleLine1Color ? { color: titleLine1Color } : undefined}>
                  {titleLine1}
                </span>
              )}
              {titleLine2 && (
                <>
                  {' '}
                  <span style={titleLine2Color ? { color: titleLine2Color } : undefined}>
                    {titleLine2}
                  </span>
                </>
              )}
              {titleLine3 && (
                <>
                  {' '}
                  <span style={titleLine3Color ? { color: titleLine3Color } : undefined}>
                    {titleLine3}
                  </span>
                </>
              )}
            </Heading>
          )}

          {subtitle && <p className="hero-subtitle">{subtitle}</p>}

          {Array.isArray(buttons) && buttons.length > 0 && (
            <div className="hero-buttons-container">
              {buttons.map((b) => {
                const tokens = mergeTokens(b?.style, b?.override);
                const rawHref = b?.link?.href || '';
                const href = normalizeHref(rawHref);

                const isAnchorLink = href.startsWith('/#');
                const isExternal = /^https?:\/\//i.test(href);
                const isInternalPage = href.startsWith('/') && !isAnchorLink;

                // Props for our <Button> (assumes your Button renders <Link> when `to` is set, <a> when `href` is set)
                const buttonProps = isInternalPage
                  ? { to: href }
                  : { href };

                return (
                  <Button
                    key={b?._key || b?.label || href}
                    {...buttonProps}
                    target={b?.link?.openInNewTab || isExternal ? '_blank' : undefined}
                    rel={b?.link?.openInNewTab || isExternal ? 'noopener noreferrer' : undefined}
                    aria-label={b?.link?.ariaLabel || undefined}
                    styleTokens={tokens}
                    onClick={(e) => handleAnchorClickOnHome(e, href)}
                  >
                    {b?.label || 'Learn more'}
                  </Button>
                );
              })}
            </div>
          )}
        </div>

        {/* Optional media (image/video) */}
        {media?.type === 'image' && media?.src && (
          <div className="hero-image">
            <img
              src={media.src}
              alt={media.alt || ''}
              loading="eager"
              decoding="async"
              sizes="(max-width: 768px) 90vw, 60vw"
            />
          </div>
        )}
        {media?.type === 'video' && media?.src && (
          <div className="hero-image">
            <video
              src={media.src}
              autoPlay
              playsInline
              muted
              loop
              preload="metadata"
            />
          </div>
        )}
      </div>
    </section>
  );
}

export default HeroSection;
