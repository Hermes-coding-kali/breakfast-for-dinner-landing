// src/components/MarketingModal.js
import React from 'react';
import { useModalStore } from '../stores/modalStore';
import { urlFor } from '../sanityClient';
import { PortableText } from '@portabletext/react';
import CheckoutButton from './CheckoutButton';
import Button from './Button'; // Import the Button component
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
  
  // Merge the base and override styles for the button
  const buttonTokens = { ...modalData.buttonStyle, ...modalData.buttonOverride };

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={closeModal}>&times;</button>
        
        <h1 className="modal-headline">{modalData.headline}</h1>

        {productImageUrl && (
          <div className="modal-image-container">
            <img
              src={productImageUrl}
              alt={modalData.featuredProduct?.name || 'Featured Product'}
              loading="lazy"
            />
          </div>
        )}

        <div className="modal-body">
          <PortableText value={modalData.body} />
        </div>

        <div className="modal-cta">
          <CheckoutButton productId={modalData.featuredProduct._id}>
            <Button styleTokens={buttonTokens}>
              {modalData.ctaText || 'Buy Now'}
            </Button>
          </CheckoutButton>
        </div>
      </div>
    </div>
  );
}

export default MarketingModal;