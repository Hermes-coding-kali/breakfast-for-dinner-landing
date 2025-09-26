// src/components/ProductDetailPage.js

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { PortableText } from "@portabletext/react";
import "./ProductDetailPage.css";
import { useCartStore } from "../stores/cartStore";
import CheckoutButton from "./CheckoutButton";
import { urlFor } from "../sanityClient";

function ProductDetailPage() {
  const { slug } = useParams();
  const { addToCart, toggleCart } = useCartStore();

  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  const [pricing, setPricing] = useState({
    price: null,
    currency: "CAD",
    stripePriceId: null,
  });
  const [pricingLoading, setPricingLoading] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    (async () => {
      try {
        setStatus("loading");
        const res = await fetch(
          `/.netlify/functions/get-product-by-slug?slug=${encodeURIComponent(slug)}`
        );
        if (!res.ok) throw new Error("Product not found.");
        const data = await res.json();

        if (!cancelled) {
          setProduct(data || null);
          setPricing({
            price: typeof data?.price === "number" ? data.price : null,
            currency: data?.currency || "CAD",
            stripePriceId: data?.stripePriceId || null,
          });
          setStatus("ready");
        }
      } catch (err) {
        console.error("Error fetching product detail:", err);
        if (!cancelled) {
          setError(err.message || "Failed to load product.");
          setStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const fetchPricing = useCallback(async (productId, fallback) => {
    if (!productId) return fallback;
    try {
      setPricingLoading(true);
      const res = await fetch(
        `/.netlify/functions/get-product-pricing?productId=${encodeURIComponent(
          productId
        )}`,
        { credentials: "same-origin" }
      );
      const data = await res.json().catch(() => ({}));
      const merged = {
        price:
          typeof data.price === "number"
            ? data.price
            : fallback?.price ?? null,
        currency: data.currency ?? fallback?.currency ?? "CAD",
        stripePriceId:
          data.stripePriceId ?? fallback?.stripePriceId ?? null,
      };
      setPricing(merged);
      return merged;
    } catch (e) {
      console.warn("pricing fetch failed; using fallback", e);
      setPricing(fallback);
      return fallback;
    } finally {
      setPricingLoading(false);
    }
  }, []);

  const onAddToCart = async () => {
    if (!product) return;
    let currentPricing = pricing;
    if (currentPricing.price == null) {
      currentPricing = await fetchPricing(product._id, {
        price: product.price ?? null,
        currency: product.currency ?? "CAD",
        stripePriceId: product.stripePriceId ?? null,
      });
    }
    const enriched = { ...product, ...currentPricing };
    addToCart(enriched);
    toggleCart();
  };

  if (status === "loading") {
    return (
      <section className="pdp">
        <div className="pdp__container">
          <h2 className="pdp__meta">Loading product…</h2>
        </div>
      </section>
    );
  }

  if (status === "error" || !product) {
    return (
      <section className="pdp">
        <div className="pdp__container">
          <h2 className="pdp__meta">{error || "Not found."}</h2>
        </div>
      </section>
    );
  }

  const title = product.title || product.name || "Untitled";
  const mainImage = product.mainImage || product.images?.[0] || null;
  const imgUrl = mainImage ? urlFor(mainImage).width(1200).auto("format").url() : null;
  const displayPrice = (pricing.price ?? product.price);
  const currency = (pricing.currency ?? product.currency ?? "CAD");
  const details = product.details || null; // ⭐️ GET DETAILS OBJECT

  return (
    <section className="pdp">
      <div className="pdp__container">
        <div className="pdp__media">
          <div className="pdp__imgFrame">
            {imgUrl ? (
              <img src={imgUrl} alt={title} className="pdp__img" loading="eager" />
            ) : (
              <div className="pdp__imgFallback">No Image</div>
            )}
          </div>
        </div>
        <div className="pdp__info">
          <h1 className="pdp__title">{title}</h1>

          <div className="pdp__priceRow">
            {displayPrice != null && (
              <div className="pdp__price">
                <span className="pdp__priceValue">${displayPrice.toFixed(2)}</span>
                <span className="pdp__currency">{currency}</span>
              </div>
            )}
          </div>

          {product.subtitle && <div className="pdp__subtitle">{product.subtitle}</div>}

          {product.description && (
            <div className="pdp__description">
              <PortableText value={product.description} />
            </div>
          )}

          {/* ⭐️ START: RENDER DETAILS ⭐️ */}
          {details && (
            <ul className="pdp__detailsList">
              {details.format && <li><strong>Format:</strong> {details.format}</li>}
              {details.pages && <li><strong>Pages:</strong> {details.pages}</li>}
              {details.dimensions && <li><strong>Dimensions:</strong> {details.dimensions}</li>}
              {details.language && <li><strong>Language:</strong> {details.language}</li>}
            </ul>
          )}
          {/* ⭐️ END: RENDER DETAILS ⭐️ */}

          <div className="pdp__actions">
            <button
              type="button"
              className="pdpBtn pdpBtn--primary"
              onClick={onAddToCart}
              disabled={pricingLoading}
              aria-busy={pricingLoading ? "true" : "false"}
            >
              {pricingLoading ? "Adding…" : "Add to Cart"}
            </button>
            <div className="pdp__checkout">
              <CheckoutButton productId={product._id} />
            </div>
          </div>

          <div className="pdp__metaRow">
            {product.inventory != null && (
              <span className={`pdp__stock ${product.inventory > 0 ? "in" : "out"}`}>
                {product.inventory > 0 ? "In stock" : "Out of stock"}
              </span>
            )}
            {product.sku && <span className="pdp__sku">SKU: {product.sku}</span>}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductDetailPage;