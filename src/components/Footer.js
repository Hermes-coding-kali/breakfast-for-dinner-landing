// src/components/Footer.js
import React from 'react';
import './Footer.css';
import { Instagram, Twitter, Facebook, Youtube, Pinterest, Tiktok } from './SocialIcons';

const iconMap = {
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook,
  youtube: Youtube,
  pinterest: Pinterest,
  tiktok: Tiktok,
};

const hx = (c) => (typeof c === 'string' ? c : c?.hex || undefined);

function mergeStyles(base = {}, override = {}) {
  const merged = { ...base };
  for (const key in override) {
    if (override[key] !== null && override[key] !== undefined) {
      merged[key] = override[key];
    }
  }
  return merged;
}

function Footer({ data }) {
  const { footerText, socialLinks = [], footerStyle, footerStyleOverride } = data || {};
  const currentYear = new Date().getFullYear();

  const styles = mergeStyles(footerStyle, footerStyleOverride);

  const styleVars = {
    '--footer-bg': hx(styles.backgroundColor) || '#212121',
    '--footer-text-color': hx(styles.textColor) || '#f0f0f0',
    '--footer-icon-color': hx(styles.socialIconColor) || '#f0f0f0',
    '--footer-icon-hover-color': hx(styles.socialIconHoverColor) || 'var(--sky-blue)',
  };

  const textToDisplay = footerText
    ? footerText.replace('{year}', currentYear)
    : `© ${currentYear} CoCo. All Rights Reserved.`;

  return (
    <footer className="app-footer" style={styleVars} role="contentinfo">
      <div className="footer-content">
        <p>{textToDisplay}</p>
        {socialLinks && socialLinks.length > 0 && (
          <div className="social-links">
            {socialLinks.map((link) => {
              const Icon = iconMap[link.platform];
              return (
                <a
                  key={link._key}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit our ${link.platform} page`}
                  className="social-icon-link"
                >
                  {Icon && <Icon />}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </footer>
  );
}

export default Footer;