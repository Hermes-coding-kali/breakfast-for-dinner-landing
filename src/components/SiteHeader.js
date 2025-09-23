// src/components/SiteHeader.js
import React, { forwardRef, useEffect, useState } from 'react';
import sanityClient from '../sanityClient';
import Header from './Header';
import MarketingBanner from './MarketingBanner';
import './SiteHeader.css';

/**
 * Wraps the marketing banner + primary header in a sticky container.
 * Receives `headerHeight` from App and passes it to Header for correct scroll offsets.
 */
const SiteHeader = forwardRef(({ data, headerHeight }, ref) => {
  const [bannerData, setBannerData] = useState(null);

  useEffect(() => {
    const fetchBannerData = async () => {
      try {
        const data = await sanityClient.fetch(
          `*[_type == "marketingBanner" && enabled == true][0]`
        );
        setBannerData(data);
      } catch (error) {
        console.error('Failed to fetch banner data:', error);
      }
    };
    fetchBannerData();
  }, []);

  return (
    <header className="site-header-container" ref={ref}>
      <MarketingBanner data={bannerData} />
      <Header data={data} headerHeight={headerHeight} />
    </header>
  );
});

export default SiteHeader;
