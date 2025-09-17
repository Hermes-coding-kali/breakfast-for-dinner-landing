import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useCartStore } from '../stores/cartStore';
import { urlFor } from '../sanityClient';
import { loadStripe } from '@stripe/stripe-js';
import './CartSidebar.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function CartSidebar() {
  const {
    items,
    isOpen,
    toggleCart,
    removeFromCart,
    updateQuantity,
    getSubtotal,
    getCurrency,
  } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const subtotal = getSubtotal();
  const currency = getCurrency();

  const formatter = useMemo(() => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currency || 'CAD',
        maximumFractionDigits: 2,
      });
    } catch {
      return { format: (n) => `$${Number(n || 0).toFixed(2)}` };
    }
  }, [currency]);

  const handleCheckout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Backend expects [{ productId, quantity }]
      const itemsForBackend = items.map((item) => ({
        productId: item._id,
        quantity: item.quantity,
      }));

      const response = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsForBackend }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || err.message || 'Checkout session failed.');
      }

      const data = await response.json();

      // Support both shapes:
      if (data?.url) {
        window.location.assign(data.url); // server returns URL (simpler flow)
        return;
      }
      if (data?.id) {
        const stripe = await stripePromise;
        if (!stripe) throw new Error('Stripe failed to load.');
        const result = await stripe.redirectToCheckout({ sessionId: data.id });
        if (result.error) throw new Error(result.error.message);
        return;
      }

      throw new Error('Invalid checkout response.');
    } catch (err) {
      console.error('Checkout Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [items]);

  // Close cart with ESC key & lock scroll when open
  useEffect(() => {
    const handleEsc = (e) => e.key === 'Escape' && isOpen && toggleCart();
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, toggleCart]);

  if (!isOpen) return null;

  return (
    <div className="cart-overlay" onClick={toggleCart} role="presentation">
      <aside
        className="cart-panel"
        onClick={(e) => e.stopPropagation()}
        aria-label="Shopping cart"
      >
        <header className="cart-header">
          <h2>Your Cart</h2>
          <button
            onClick={toggleCart}
            className="icon-button"
            aria-label="Close cart"
          >
            ×
          </button>
        </header>

        {items.length === 0 ? (
          <div className="cart-empty">
            <p>Your cart is empty.</p>
          </div>
        ) : (
          <>
            <div className="cart-list">
              {items.map((item) => {
                const imageUrl = item.mainImage
                  ? urlFor(item.mainImage).width(96).height(96).fit('crop').url()
                  : null;
                const unit = formatter.format(item.price || 0);

                return (
                  <div key={item._id} className="cart-row">
                    <div className="cart-thumb">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.title}
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="cart-thumb--placeholder" aria-hidden />
                      )}
                    </div>

                    <div className="cart-info">
                      <div className="cart-title-row">
                        <h3 className="cart-title">{item.title}</h3>
                        <button
                          className="icon-button subtle"
                          aria-label={`Remove ${item.title}`}
                          onClick={() => removeFromCart(item._id)}
                          title="Remove item"
                        >
                          ×
                        </button>
                      </div>

                      <div className="cart-meta">
                        {/* Unit price */}
                        <span className="cart-price">{unit}</span>

                        {/* Multiplication sign (no per-item subtotal) */}
                        <span className="cart-multiply">×</span>

                        {/* Quantity controls */}
                        <div className="qty-controls" aria-label="Quantity controls">
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                            disabled={item.quantity <= 1}
                          >
                            −
                          </button>
                          <span className="qty-value" aria-live="polite">
                            {item.quantity}
                          </span>
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        {/* Removed per-item subtotal display */}
                        {/* <span className="cart-line-total">{lineTotal}</span> */}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <footer className="cart-footer">
              <div className="cart-subtotal">
                <span>Subtotal</span>
                <strong>{formatter.format(subtotal)}</strong>
              </div>
              {error && <p className="cart-error">{error}</p>}
              <button
                onClick={handleCheckout}
                className="checkout-button"
                disabled={loading}
              >
                {loading ? 'Processing…' : 'Proceed to Checkout'}
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}

export default CartSidebar;
