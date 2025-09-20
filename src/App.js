// src/App.js
import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import './App.css';
import sanityClient from './sanityClient';
import { useModalStore } from './stores/modalStore';

// --- Component Imports ---
import SiteHeader from './components/SiteHeader';
import Footer from './components/Footer';
import MarketingModal from './components/MarketingModal';
import HomePage from './components/HomePage';
import StorePage from './components/StorePage';
import ProductDetailPage from './components/ProductDetailPage';
import Success from './components/Success';
import Cancel from './components/Cancel';
import ScrollToTopButton from './components/ScrollToTopButton';
import CartSidebar from './components/CartSidebar';
import ThemeInjector from './components/ThemeInjector';
import ScrollToHash from './components/ScrollToHash'; // <-- ADD THIS

// Query for global site settings and navigation
const SITE_CONFIG_QUERY = /* groq */ `*[_type == "siteConfig"][0]{
  siteTitle,
  footerText,
  socialLinks[]{
    _key,
    platform,
    url
  },
  "headerStyle": headerStyle->{...},
  "headerStyleOverride": headerStyleOverride{...},
  "footerStyle": footerStyle->{...},
  "footerStyleOverride": footerStyleOverride{...},
  "featuredProduct": featuredProduct->{ _id, name, images },
  "buttonStyle": buttonStyle->{...},
  "buttonOverride": buttonOverride{...}
}`;
function App() {
  const { setModalData, openModal } = useModalStore();
  const location = useLocation();
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef(null);

  const { data: siteConfig } = useQuery({
    queryKey: ['siteConfig'],
    queryFn: () => sanityClient.fetch(SITE_CONFIG_QUERY),
    staleTime: Infinity,
  });

  // Keep headerHeight in sync with sticky header (banner + header)
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
    };
    const ro = new ResizeObserver(updateHeaderHeight);
    if (headerRef.current) ro.observe(headerRef.current);
    updateHeaderHeight();
    return () => ro.disconnect();
  }, []);

  // Marketing modal data
  useEffect(() => {
    const fetchModalData = async () => {
      try {
        const data = await sanityClient.fetch(
          `*[_type == "marketingModal" && enabled == true][0]{
            ...,
            "featuredProduct": featuredProduct->{ _id, name, images }
          }`
        );
        if (data) setModalData(data);
      } catch (error) {
        console.error('Failed to fetch modal data:', error);
      }
    };
    fetchModalData();
  }, [setModalData]);

  // Show modal on home after short delay
  useEffect(() => {
    if (location.pathname === '/') {
      const t = setTimeout(() => openModal(), 1500);
      return () => clearTimeout(t);
    }
  }, [location.pathname, openModal]);

  return (
    <div className="App">
      <ThemeInjector />
      <SiteHeader ref={headerRef} data={siteConfig} headerHeight={headerHeight} />

      {/* 👇 Add this anywhere under the Router; here is perfect */}
      <ScrollToHash offset={headerHeight} />

      <CartSidebar />
      <MarketingModal />
      <main style={{ paddingTop: headerHeight }}>
        <Routes>
          {/* 👇 PASS headerHeight to HomePage here */}
          <Route path="/" element={<HomePage offset={headerHeight} />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="/store/:slug" element={<ProductDetailPage />} />
          <Route path="/success" element={<Success />} />
          <Route path="/cancel" element={<Cancel />} />
        </Routes>
      </main>
      <ScrollToTopButton />
      <Footer data={siteConfig} />
    </div>
  );
}

function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

export default AppWrapper;