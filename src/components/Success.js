// src/components/Success.js
import React, { useEffect } from 'react';
import { useCartStore } from '../stores/cartStore';
import Button from './Button';
import './SuccessPage.css';

function Success() {
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="success-page-container">
      <div className="confetti-container">
        <span>🎉</span><span>🥳</span><span>🎊</span><span>🎈</span><span>✨</span>
        <span>🎉</span><span>🥳</span><span>🎊</span><span>🎈</span><span>✨</span>
      </div>
      <div className="success-card">
        <div className="success-icon-wrapper">
          <svg className="success-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle className="success-checkmark__circle" cx="26" cy="26" r="25" fill="none" />
            <path className="success-checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </div>
        <h2 className="success-title">Success!</h2>
        <p className="success-message">Your order is confirmed! A receipt is on its way to your inbox.</p>
        <p className="success-note">
          If you don't see a receipt, please contact <a href="mailto:br3akfast.f0r.dinn3r@gmail.com">br3akfast.f0r.dinn3r@gmail.com</a>.
        </p>
        <Button
          to="/"
          styleTokens={{ backgroundColor: '#fb8c00', textColor: '#212121' }}
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
}

export default Success;