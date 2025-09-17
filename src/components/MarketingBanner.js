// src/components/MarketingBanner.js

import React, { useState, useEffect, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { urlFor } from '../sanityClient';
import './MarketingBanner.css';

const MarketingBanner = forwardRef(({ data }, ref) => {
  // We now only use a simple state to track visibility
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // If there's no data, do nothing.
    if (!data) {
      setIsVisible(false);
      return;
    }

    // Check if the banner is within its scheduled date range
    const now = new Date();
    const startDate = data.startDate ? new Date(data.startDate) : null;
    const endDate = data.endDate ? new Date(data.endDate) : null;

    if (startDate && now < startDate) return; // Not started yet
    if (endDate && now > endDate) return;   // Already ended

    // If all checks pass, show the banner
    setIsVisible(true);
  }, [data]);

  const handleClose = () => {
    // Clicking 'x' now only hides it for the current view.
    // It will reappear on the next page load or refresh.
    setIsVisible(false);
  };

  if (!data || !isVisible) {
    return null;
  }
  
  const bannerStyle = {
    backgroundColor: data.backgroundColor?.hex,
    color: data.textColor?.hex,
  };

  const bannerClasses = `marketing-banner banner-${data.variant || 'info'}`;
  const iconUrl = data.image ? urlFor(data.image).width(50).url() : null;

  return (
    <div className={bannerClasses} style={bannerStyle} ref={ref}>
      <div className="banner-content">
        {iconUrl && <img src={iconUrl} alt="Banner Icon" className="banner-icon" />}
        <p className="banner-text">{data.text}</p>
        <div className="banner-ctas">
          {data.ctas?.map((cta, index) => {
            const isInternal = cta.link?.startsWith('/');
            return isInternal ? (
              <Link key={index} to={cta.link} className="banner-button">
                {cta.text}
              </Link>
            ) : (
              <a key={index} href={cta.link} className="banner-button" target="_blank" rel="noopener noreferrer">
                {cta.text}
              </a>
            );
          })}
        </div>
      </div>
      <button className="banner-close" onClick={handleClose} style={{ color: bannerStyle.color }}>
        &times;
      </button>
    </div>
  );
});

export default MarketingBanner;