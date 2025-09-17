import React, { useRef, useState, useCallback } from "react";
import { PortableText } from "@portabletext/react";
import { Link, useNavigate } from "react-router-dom";
import { urlFor } from "../sanityClient";
import CheckoutButton from "./CheckoutButton";
import { useCartStore } from "../stores/cartStore";
import "./ProductCard.css";

function ProductCard({ product, view = "card" }) {
  // ---- hooks must be at the top, unconditionally ----
  const { addToCart, toggleCart } = useCartStore();
  const imgRef = useRef(null);
  const navigate = useNavigate();

  // pricing state lives here (unconditional)
  const [pricing, setPricing] = useState({
    price: product && typeof product.price === "number" ? product.price : null,
    currency: (product && product.currency) || "CAD",
    stripePriceId: (product && product.stripePriceId) || null,
  });
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingError, setPricingError] = useState(null);

  // ---- normalize safely even if product is null/undefined ----
  const resolvedSlug =
    typeof product?.slug === "string"
      ? product.slug
      : product?.slug?.current ?? "";

  const normalized = {
    _id: product?._id,
    title: product?.title ?? product?.name ?? "Untitled",
    slug: resolvedSlug,
    price:
      typeof product?.price === "number" ? product.price : pricing.price ?? null,
    currency: pricing.currency ?? product?.currency ?? "CAD",
    stripePriceId: pricing.stripePriceId ?? product?.stripePriceId ?? null,
    mainImage: product?.mainImage ?? product?.images?.[0] ?? null,
    description: product?.description ?? null,
    inventory:
      typeof product?.inventory === "number" ? product.inventory : undefined,
  };

  const mainImageUrl = normalized.mainImage
    ? urlFor(normalized.mainImage).width(800).auto("format").url()
    : null;

  const isSoldOut =
    normalized.inventory !== undefined && normalized.inventory <= 0;

  // ---- callbacks also must be declared unconditionally ----
  const fetchPricing = useCallback(async () => {
    if (pricing.price != null && pricing.currency && pricing.stripePriceId) {
      return;
    }
    if (!normalized._id) return;

    try {
      setPricingLoading(true);
      setPricingError(null);
      const res = await fetch(
        `/.netlify/functions/get-product-pricing?productId=${encodeURIComponent(
          normalized._id
        )}`,
        { credentials: "same-origin" }
      );
      const data = await res.json().catch(() => ({}));
      setPricing((prev) => ({
        price:
          typeof data.price === "number"
            ? data.price
            : prev.price ?? normalized.price ?? null,
        currency: data.currency ?? prev.currency ?? normalized.currency ?? "CAD",
        stripePriceId:
          data.stripePriceId ??
          prev.stripePriceId ??
          normalized.stripePriceId ??
          null,
      }));
    } catch (err) {
      console.error("fetchPricing error:", err);
      setPricingError("Failed to fetch pricing.");
    } finally {
      setPricingLoading(false);
    }
  }, [
    normalized._id,
    normalized.price,
    normalized.currency,
    normalized.stripePriceId,
    pricing.price,
    pricing.currency,
    pricing.stripePriceId,
  ]);

  const bounce = () => {
    if (!imgRef.current) return;
    imgRef.current.classList.add("bounce");
    imgRef.current.addEventListener(
      "animationend",
      () => imgRef.current && imgRef.current.classList.remove("bounce"),
      { once: true }
    );
  };

  const onAddToCart = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (pricing.price == null) await fetchPricing();

    const enriched = {
      ...product,
      price: (pricing.price ?? product?.price) ?? null,
      currency: (pricing.currency ?? product?.currency) ?? "CAD",
      stripePriceId:
        (pricing.stripePriceId ?? product?.stripePriceId) ?? null,
    };

    addToCart(enriched);
    toggleCart();
  };

  const onViewDetails = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (normalized.slug) navigate(`/store/${normalized.slug}`);
  };

  // ---- render guard (AFTER hooks) ----
  if (!product) return null;

  return (
    <div className={`product-card ${view}`} onMouseLeave={bounce}>
      <div className="product-image-wrap">
        {mainImageUrl ? (
          <img
            ref={imgRef}
            src={mainImageUrl}
            alt={normalized.title}
            className="product-image"
            loading="lazy"
          />
        ) : (
          <div className="product-image-fallback">No Image</div>
        )}
        {isSoldOut && <div className="sold-out">Sold Out</div>}
      </div>

      <div className="product-body">
        <div className="product-head">
          <h2 className="product-title">
            {view === "card" ? (
              <Link className="product-title-link" to={`/store/${normalized.slug}`}>
                {normalized.title}
              </Link>
            ) : (
              normalized.title
            )}
          </h2>

          {normalized.price != null && (
            <div className="price-badge">${Number(normalized.price).toFixed(2)}</div>
          )}
        </div>

        {view === "detail" && normalized.description && (
          <div className="product-description">
            <PortableText value={normalized.description} />
          </div>
        )}

        <div className="product-actions">
          {!isSoldOut ? (
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onAddToCart}
                disabled={pricingLoading}
                aria-busy={pricingLoading ? "true" : "false"}
              >
                {pricingLoading ? "Adding…" : "Add to Cart"}
              </button>

              {view === "card" && (
                <button
                  type="button"
                  className="btn btn-primary-alt"
                  onClick={onViewDetails}
                >
                  View Details
                </button>
              )}

              {view === "detail" && normalized._id ? (
                <CheckoutButton productId={normalized._id} />
              ) : null}
            </>
          ) : (
            <div className="buy-unavailable">Not available</div>
          )}
        </div>

        {pricingError && (
          <div className="buy-unavailable" role="status">
            {pricingError}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
