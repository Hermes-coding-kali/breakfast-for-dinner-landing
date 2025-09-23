// src/components/CheckoutButton.jsx
import React, { useState } from 'react';

async function createSession(payload) {
  const res = await fetch('/.netlify/functions/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Checkout session failed');
  }
  return res.json();
}

export default function CheckoutButton({
  productId,
  quantity = 1,
  children,
  label = 'Buy now',
  className,
  style,
}) {
  const [loading, setLoading] = useState(false);

  const startCheckout = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (loading) return;

    try {
      setLoading(true);
      const data = await createSession({ productId, quantity }); // ← matches server
      if (data?.url) {
        window.location.assign(data.url);
        return;
      }
      throw new Error('No checkout URL returned');
    } catch (err) {
      console.error('[CheckoutButton] Error:', err);
      alert('Sorry—could not start checkout.');
      setLoading(false);
    }
  };

  if (children) {
    return React.cloneElement(children, {
      onClick: startCheckout,
      disabled: children.props.disabled || loading,
      'aria-busy': loading ? 'true' : undefined,
    });
  }

  return (
    <button className={className} style={style} onClick={startCheckout} disabled={loading}>
      {loading ? 'Processing…' : label}
    </button>
  );
}
