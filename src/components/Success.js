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
        {/* 1. Added more confetti elements */}
        <div className="confetti-container">
            <span>🎉</span><span>🥳</span><span>🎊</span><span>🎈</span><span>✨</span>
            <span>🎉</span><span>🥳</span><span>🎊</span><span>🎈</span><span>✨</span>
        </div>
        <div className="success-card">
            <div className="success-icon-wrapper">
              <svg className="success-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle className="success-checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
                <path className="success-checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
            </div>
            <h2 className="success-title">Success!</h2>
            <p className="success-message">Your order is confirmed! A receipt is on its way to your inbox.</p>
            {/* 2. Changed button to a more vibrant variant */}
            <Button to="/" variant="add-to-cart">Back to Home</Button>
        </div>
    </div>
  );
}

export default Success;