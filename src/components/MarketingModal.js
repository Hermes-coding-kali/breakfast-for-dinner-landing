// src/components/MarketingModal.js

import React from 'react';
import { useModalStore } from '../stores/modalStore';
import { urlFor } from '../sanityClient';
import { PortableText } from '@portabletext/react';
import CheckoutButton from './CheckoutButton';
import './MarketingModal.css';

function MarketingModal() {
  const { isOpen, modalData, closeModal } = useModalStore();

  if (!isOpen || !modalData) return null;

  const productImageUrl =
    modalData.featuredProduct?.images?.[0]?.asset
      ? urlFor(modalData.featuredProduct.images[0].asset)
          .width(800)
          .auto('format')
          .quality(80)
          .url()
      : null;

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={closeModal}>&times;</button>
        
        {/* --- NEW ELEMENT ORDER --- */}

        {/* 1. Headline */}
        <h1 className="modal-headline">{modalData.headline}</h1>

        {/* 2. Image */}
        {productImageUrl && (
          <div className="modal-image-container">
            <img
              src={productImageUrl}
              alt={modalData.featuredProduct?.name || 'Featured Product'}
              loading="lazy"
            />
          </div>
        )}

        {/* 3. Description (Body) */}
        <div className="modal-body">
          <PortableText value={modalData.body} />
        </div>

        {/* 4. Call to Action Button */}
        <div className="modal-cta">
          <CheckoutButton productId={modalData.featuredProduct._id} />
        </div>
      </div>
    </div>
  );
}

export default MarketingModal;