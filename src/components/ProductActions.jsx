// src/components/ProductActions.jsx
import React from 'react';
import CheckoutButton from './CheckoutButton';
import { useCartStore } from '../stores/cartStore';
import { normalizeProduct, deriveStatus } from './productState';
import Button from './Button'; // <-- 1. IMPORT THE NEW BUTTON

/**
 * Renders product action buttons.
 * context: "card" | "detail" | "presale"
 */
export default function ProductActions({ product, context }) {
  const addToCart = useCartStore((s) => s.addToCart);
  const p = normalizeProduct(product);
  const status = deriveStatus(p);
  const openCartPanel = () => useCartStore.getState().openCart();

  const onAdd = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    addToCart(p);
    openCartPanel();
  };

  // --- 2. REPLACE ALL <button> AND <a> with <Button> ---
  const ViewDetails = p.slug ? (
    <Button
      to={`/store/${p.slug}`}
      variant="secondary"
      onClick={(e) => e.stopPropagation()}
    >
      View details
    </Button>
  ) : null;

  const AddToCartBtn = (
    <Button
      variant="add-to-cart"
      onClick={onAdd}
      aria-label={`Add ${p.title} to cart`}
    >
      Add to cart
    </Button>
  );

  const PreorderBtn = (
    <Button
      variant="preorder"
      onClick={onAdd}
      aria-label={`Pre-order ${p.title}`}
    >
      Pre-order
    </Button>
  );

  const CheckoutNow = status.canCheckout ? <CheckoutButton productId={p._id} /> : null;

  const ExternalBuy = p.externalUrl ? (
    <Button
      href={p.externalUrl}
      variant="buy-external"
      onClick={(e) => e.stopPropagation()}
    >
      Buy from partner
    </Button>
  ) : null;
  // --- END OF REPLACEMENT ---

  if (context === 'card') {
    return <div className="product-actions">{ViewDetails}</div>;
  }

  if (status.missingPrice) {
    return (
      <div className="product-actions">
        <Button variant="secondary" disabled>Price unavailable</Button>
        {ExternalBuy}
      </div>
    );
  }

  const primary = status.isPresale ? PreorderBtn : AddToCartBtn;

  return (
    <div className="product-actions">
      {primary}
      {CheckoutNow}
      {ExternalBuy}
    </div>
  );
}