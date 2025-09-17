// src/components/Cancel.js
import React from 'react';
import Button from './Button';
import './CancelPage.css'; // Use the new dedicated stylesheet

function Cancel() {
  return (
    <div className="cancel-page-container">
        <div className="cancel-card">
            <h2 className="cancel-title">Order Canceled</h2>
            <p className="cancel-message">
              Your order has been canceled. Your card was not charged.
            </p>
            <Button to="/store" variant="preorder">Continue Shopping</Button>
        </div>
    </div>
  );
}

export default Cancel;