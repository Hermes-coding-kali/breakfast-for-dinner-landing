// src/components/Header.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import './Header.css';

// The navigation links are now defined here
const navItems = [
  { label: 'Home', path: '/#hero' },
  { label: 'Store', path: '/store' },
  { label: 'About', path: '/#about' }, // This is an anchor link to the 'about' section on the homepage
  { label: 'Game', path: '/#food-sort-game' }, // <-- ADDED THIS LINE

];

// Helper to get hex value from Sanity color object
const hx = (c) => (typeof c === 'string' ? c : c?.hex || undefined);

// Merges the base style with any overrides
function mergeStyles(base = {}, override = {}) {
  const merged = { ...base };
  for (const key in override) {
    if (override[key] !== null && override[key] !== undefined) {
      merged[key] = override[key];
    }
  }
  return merged;
}

function Header({ data, headerHeight = 0 }) {
  const { siteTitle, headerStyle, headerStyleOverride } = data || {};
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { toggleCart, getTotalItems } = useCartStore();
  const totalItems = getTotalItems();

  const styles = mergeStyles(headerStyle, headerStyleOverride);

  // --- Create CSS Variables from Sanity data ---
  const styleVars = {
    '--header-bg': hx(styles.backgroundColor) || 'var(--pants-purple)',
    '--header-padding-y': styles.paddingY ? `${styles.paddingY}px` : '10px',
    '--header-padding-x': styles.paddingX ? `${styles.paddingX}px` : '25px',
    '--header-title-color': hx(styles.titleColor) || '#ffffff',
    '--header-title-stroke': hx(styles.titleStrokeColor) || 'var(--text-dark)',
    '--header-title-size': styles.titleFontSize ? `${styles.titleFontSize}em` : '1.8em',
    '--header-link-color': hx(styles.linkColor) || '#ffffff',
    '--header-link-hover-color': hx(styles.linkHoverColor) || '#ffffff',
    '--header-link-font': styles.linkFont || "'Baloo 2', cursive",
    '--header-link-size': styles.linkFontSize ? `${styles.linkFontSize}em` : '1.1em',
    '--header-cart-icon-color': hx(styles.cartIconColor) || '#ffffff',
    '--header-cart-badge-bg': hx(styles.cartBadgeBgColor) || 'var(--title-yellow)',
    '--header-cart-badge-text': hx(styles.cartBadgeTextColor) || 'var(--text-dark)',
    '--header-cart-badge-border': hx(styles.cartBadgeBorderColor) || 'var(--text-dark)',
  };
  // ---------------------------------------------

  const closeMenu = () => setIsOpen(false);
  const toggleMenu = () => setIsOpen((o) => !o);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const scrollToId = useCallback(
    (id) => {
      const el = document.getElementById(id);
      if (!el) return false;
      const y = el.getBoundingClientRect().top + window.pageYOffset - (headerHeight || 0);
      window.scrollTo({ top: y, behavior: 'smooth' });
      return true;
    },
    [headerHeight]
  );

  const handleNavClick = async (event, path) => {
    event.preventDefault();
    closeMenu();

    if (!path?.includes('#')) return;

    const targetId = path.split('#')[1];
    const isHome = location.pathname === '/';

    if (isHome) {
      scrollToId(targetId);
    } else {
      navigate(path.split('#')[0] || '/');
      let tries = 0;
      const maxTries = 20;
      const tryScroll = () => {
        if (scrollToId(targetId) || tries >= maxTries) return;
        tries += 1;
        setTimeout(tryScroll, 75);
      };
      setTimeout(tryScroll, 75);
    }
  };

  return (
    <header id="main-header" className="app-header fixed-header" style={styleVars}>
      {/* Text title (desktop/tablet only; hidden on mobile) */}
      <div className="header-title">
        <Link to="/">{siteTitle || 'Breakfast for Dinner'}</Link>
      </div>

      {/* Image logo (mobile only; hidden on desktop/tablet via CSS) */}
      <Link
        to="/"
        className="header-logo"
        aria-label={siteTitle ? `${siteTitle} home` : 'Home'}
      >
        <img
          src={mobileLogoUrl || '../assets/Breakfast-header.webp'} // <-- put your mobile logo path here
          alt={siteTitle || 'Site logo'}
          width="120"
          height="36"
          loading="eager"
          decoding="async"
        />
      </Link>

      <div className="header-right-group">
        <nav
          className={`header-nav ${isOpen ? 'mobile-open' : ''}`}
          id="mobile-nav-list"
          aria-label="Primary"
        >
          <ul>
            {navItems.map((item) => {
              const { label, path } = item;
              const isAnchor = path.includes('#');

              return (
                <li key={path}>
                  {isAnchor ? (
                    <a href={path} onClick={(e) => handleNavClick(e, path)}>
                      {label}
                    </a>
                  ) : (
                    <Link to={path}>{label}</Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          onClick={toggleCart}
          className="cart-button"
          aria-label={`View cart with ${totalItems} item${totalItems === 1 ? '' : 's'}`}
        >
          <svg
            className="cart-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
          {totalItems > 0 && <span className="cart-item-count" aria-live="polite">{totalItems}</span>}
        </button>

        <button
          className="hamburger-button"
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
          aria-controls="mobile-nav-list"
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </button>
      </div>
    </header>
  );
}

export default Header;