// src/components/FeaturedItemSection.jsx
import React, { useEffect, useState, useCallback } from 'react';
import './FeaturedItemSection.css';
import Button from './Button';
import { PortableText } from '@portabletext/react';
import { useCartStore } from '../stores/cartStore';
import CheckoutButton from './CheckoutButton';

function hx(c) { return typeof c === 'string' ? c : c?.hex || undefined; }
function formatPrice(amount, currency = 'CAD') {
  if (typeof amount !== 'number') return null;
  try { return new Intl.NumberFormat('en-CA', { style: 'currency', currency }).format(amount); }
  catch { return `$${amount}`; }
}

/**
 * Normalize section data so this component works with:
 * - OLD flat shape (fields directly on data)
 * - NEW refactored shape ({ content: {...}, style: {...} })
 */
function normalizeFeaturedData(raw) {
  if (!raw) return null;

  const hasRefactor = raw.content || raw.style;
  if (hasRefactor) {
    const c = raw.content || {};
    const s = raw.style || {};
    return {
      // content
      eyebrow: c.eyebrow,
      heading: c.heading,
      subheading: c.subheading,
      disclaimer: c.disclaimer,
      product: c.product,

      // layout
      alignment: s.alignment ?? 'center',
      maxWidth: s.maxWidth ?? 800,
      paddingY: s.paddingY ?? 60,
      paddingX: s.paddingX ?? 20,
      stackOn: s.stackOn ?? 'md',

      // card
      cardBg: s.cardBg,
      cardBorderColor: s.cardBorderColor,
      cardBorderWidth: s.cardBorderWidth ?? 3,
      cardBorderStyle: s.cardBorderStyle ?? 'dashed',
      cardRadius: s.cardRadius ?? 20,
      cardShadow: s.cardShadow ?? '6px 6px 0 rgba(0,0,0,0.12)',
      titleColor: s.titleColor,
      subtitleColor: s.subtitleColor,
      textColor: s.textColor,

      // optional pattern fields
      patternStyle: s.patternStyle,
      patternColor: s.patternColor,
      patternOpacity: s.patternOpacity,
      patternAngle: s.patternAngle,

      // image (prefer style; fall back to top-level fields resolved in GROQ)
      imageSource: s.imageSource ?? 'fromProduct',
      image: s.image || raw.image || null,
      imageUrl: s.imageUrl || raw.imageUrl || null,
      imageAlt: s.imageAlt || raw.imageAlt || c.product?.name || null,
      imageBg: s.imageBg,
      imageBorderColor: s.imageBorderColor,
      imageBorderWidth: s.imageBorderWidth ?? 4,
      imageRadius: s.imageRadius ?? 18,
      imageAspect: s.imageAspect ?? 'auto',
      imageShadowColor: s.imageShadowColor,
      imageShadowOffset: s.imageShadowOffset ?? { x: 6, y: 6 },
      imageShadowBlur: s.imageShadowBlur ?? 0,
      stickerOutlineColor: s.stickerOutlineColor,
      stickerOutlineWidth: s.stickerOutlineWidth,
      imageTilt: s.imageTilt,
      tapeEnabled: s.tapeEnabled,
      tapeBg: s.tapeBg,
      tapeBorderColor: s.tapeBorderColor,
      tapeRotation: s.tapeRotation,
      tapeSize: s.tapeSize,

      // price
      showPrice: s.showPrice ?? true,
      priceStyle: s.priceStyle ?? 'badge',
      priceBg: s.priceBg,
      priceTextColor: s.priceTextColor,
      priceBorderColor: s.priceBorderColor,
      priceBorderWidth: s.priceBorderWidth ?? 3,
      priceRadius: s.priceRadius ?? 14,
      priceShadow: s.priceShadow ?? '3px 3px 0 rgba(0,0,0,0.12)',
      showCompareAt: s.showCompareAt ?? false,
      showCurrency: s.showCurrency ?? true,
      priceVariant: s.priceVariant ?? 'pill',
      priceAccentColor: s.priceAccentColor,

      // buttons (carry through base style ref + override — merge in Button)
      primaryButton: s.primaryButton || {},
      secondaryButton: s.secondaryButton || {},
    };
  }

  // Old flat shape (backward compatible)
  return raw;
}

export default function FeaturedItemSection({ data }) {
  // --- HOOKS MOVED TO TOP ---
  const { addToCart, toggleCart } = useCartStore();
  const n = normalizeFeaturedData(data);
  const [pricing, setPricing] = useState({
    price: n?.product?.price ?? null,
    currency: n?.product?.currency ?? null,
    stripePriceId: n?.product?.stripePriceId ?? null,
  });
  const [imgLoaded, setImgLoaded] = useState(false);

  // This early return can now safely stay here
  if (!n || !n.product) return null;

  const {
    eyebrow, heading, subheading, disclaimer,
    alignment = 'center', maxWidth = 800, paddingY = 60, paddingX = 20, stackOn = 'md',

    // Card
    cardBg, cardBorderColor, cardBorderWidth = 3, cardBorderStyle = 'dashed',
    cardRadius = 20, cardShadow = '6px 6px 0 rgba(0,0,0,0.12)',
    titleColor, subtitleColor, textColor,

    // Image
    imageSource = 'fromProduct', image, imageUrl: imageUrlFromNormalize, imageAlt,
    imageBg, imageBorderColor, imageBorderWidth = 4,
    imageRadius = 18, imageAspect = 'auto',
    imageShadowColor, imageShadowOffset = { x: 6, y: 6 }, imageShadowBlur = 0,

    // Product
    product,
    showPrice = true, priceStyle = 'badge',
    priceBg, priceTextColor, priceBorderColor, priceBorderWidth = 3, priceRadius = 14, priceShadow = '3px 3px 0 rgba(0,0,0,0.12)',
    showCompareAt = false, showCurrency = true,
    priceVariant, priceAccentColor,

    // Buttons
    primaryButton = {}, secondaryButton = {},
  } = n;

  // ---------- PRICING FETCH ----------
  const slugStr = typeof product?.slug === 'string' ? product.slug : product?.slug?.current;

  const fetchPricing = useCallback(async () => {
    if (!slugStr) return;
    try {
      const res = await fetch(`/.netlify/functions/get-product-by-slug?slug=${encodeURIComponent(slugStr)}`);
      if (!res.ok) throw new Error('Failed to fetch pricing');
      const data = await res.json();
      setPricing({
        price: typeof data.price === 'number' ? data.price : null,
        currency: (data.currency || 'CAD').toUpperCase(),
        stripePriceId: data.stripePriceId || null,
      });
    } catch (err) {
      console.error('[FeaturedItemSection] pricing fetch error:', err);
    }
  }, [slugStr]);

  useEffect(() => {
    if (pricing.price == null) fetchPricing();
  }, [fetchPricing, pricing.price]);
  // -----------------------------------

  // Prefer style.custom image, then product[0], then top-level resolved imageUrl from GROQ
  const resolvedImageUrl =
    (image && image.asset && image.asset.url) ||
    (imageUrlFromNormalize) ||
    null;

  const productFirstUrl =
    product?.images?.[0]?.asset?.url || null;

  const finalImage =
    (imageSource === 'custom' && image?.asset?.url)
      ? { url: image.asset.url, alt: imageAlt || product?.name || 'Product image' }
      : (imageSource === 'fromProduct' && productFirstUrl)
        ? { url: productFirstUrl, alt: product?.name || 'Product image' }
        : (resolvedImageUrl
            ? { url: resolvedImageUrl, alt: imageAlt || product?.name || 'Product image' }
            : null);

  // Debug snapshot
  useEffect(() => {
    console.debug('[FeaturedItemSection] img pick', {
      imageSource,
      styleImageHasUrl: !!image?.asset?.url,
      productFirstHasUrl: !!productFirstUrl,
      resolvedImageUrl: resolvedImageUrl || undefined,
      finalHasImage: !!finalImage,
    });
  }, [imageSource, image, productFirstUrl, resolvedImageUrl, finalImage]);

  // Track image load for a basic loading state
  useEffect(() => { setImgLoaded(false); }, [finalImage?.url]);

  const sectionStyle = { padding: `${paddingY}px ${paddingX}px` };
  const shellStyle = { maxWidth: `${maxWidth}px`, textAlign: alignment };
  const cardStyle = {
    background: hx(cardBg) || '#fffbeb',
    border: cardBorderWidth ? `${cardBorderWidth}px ${cardBorderStyle} ${hx(cardBorderColor) || '#212121'}` : 'none',
    borderRadius: `${cardRadius}px`,
    boxShadow: cardShadow,
    color: hx(textColor) || '#212121',
  };

  // NOTE: no forced width — let the grid column control it.
  const imgWrapStyle = {
    background: hx(imageBg) || 'transparent',
    border: imageBorderWidth ? `${imageBorderWidth}px solid ${hx(imageBorderColor) || 'transparent'}` : 'none',
    borderRadius: `${imageRadius}px`,
    boxShadow: `${imageShadowOffset?.x ?? 6}px ${imageShadowOffset?.y ?? 6}px ${imageShadowBlur}px ${hx(imageShadowColor) || 'transparent'}`,
    aspectRatio: imageAspect !== 'auto' ? imageAspect.replace(':', ' / ') : undefined,
  };

  const priceNode = () => {
    if (!showPrice) return null;
    const priceVal = pricing.price ?? product.price;
    if (priceVal == null) return null;

    const currency = showCurrency ? (pricing.currency || product.currency || 'CAD') : 'CAD';
    const main = formatPrice(priceVal, currency);
    const compare = showCompareAt && typeof product.compareAt === 'number'
      ? formatPrice(product.compareAt, currency)
      : null;

    if (priceStyle === 'badge') {
      const badgeExtra = priceVariant === 'tag'
        ? { position: 'relative', paddingLeft: 26 }
        : null;

      return (
        <span
          className="fi-price-badge"
          style={{
            background: hx(priceBg) || '#fffdf5',
            color: hx(priceTextColor) || '#212121',
            border: priceBorderWidth ? `${priceBorderWidth}px solid ${hx(priceBorderColor) || '#212121'}` : 'none',
            borderRadius: `${priceRadius}px`,
            boxShadow: priceShadow,
            ...badgeExtra,
          }}
        >
          {priceVariant === 'tag' && (
            <span
              aria-hidden
              style={{
                position: 'absolute',
                left: 10, top: '50%', transform: 'translateY(-50%)',
                width: 8, height: 8, borderRadius: '50%',
                background: hx(priceAccentColor) || '#212121',
                opacity: 0.9,
              }}
            />
          )}
          {main}
          {compare ? <span style={{ marginLeft: 8, textDecoration: 'line-through', opacity: 0.75 }}>{compare}</span> : null}
        </span>
      );
    }

    return (
      <div className="fi-price-inline" style={{ color: hx(priceTextColor) }}>
        {main}
        {compare ? <span style={{ marginLeft: 8, textDecoration: 'line-through', opacity: 0.75 }}>{compare}</span> : null}
      </div>
    );
  };

  const renderButton = (buttonData) => {
    if (!buttonData || !buttonData.label) return null;
    const { label, action = 'linkToPDP', link, style, override, fullWidth, maxWidth: btnMaxWidth } = buttonData;

    // Merge base style doc + override for the <Button />
    const btnTokens = { ...(style || {}), ...(override || {}) };

    const buttonLayout = {
      display: 'inline-block',
      width: fullWidth ? '100%' : 'auto',
      maxWidth: btnMaxWidth ? `${btnMaxWidth}px` : 'none',
    };

    const props = {};
    const slugStr = typeof product?.slug === 'string' ? product.slug : product?.slug?.current;

    if (action === 'customLink' && link?.href) {
      props.to = link.href;
      if (link.openInNewTab) props.target = '_blank';
    } else if (action === 'linkToPDP' && slugStr) {
      props.to = `/store/${slugStr}`;
    } else if (action === 'addToCart') {
      props.onClick = async (e) => {
        e?.preventDefault(); e?.stopPropagation();
        if (pricing.price == null) await fetchPricing();
        const enriched = {
          ...product,
          price: pricing.price ?? product.price ?? null,
          currency: pricing.currency ?? product.currency ?? 'CAD',
          stripePriceId: pricing.stripePriceId ?? product.stripePriceId ?? null,
        };
        addToCart(enriched);
        toggleCart();
      };
    } else if (action === 'buyNow') {
      return (
        <div className="fi-cta" style={buttonLayout}>
          <CheckoutButton productId={product?._id}>
            <Button styleTokens={btnTokens} aria-label={`Buy ${product?.name || 'item'} now`}>
              {label || 'Buy now'}
            </Button>
          </CheckoutButton>
        </div>
      );
    }

    return (
      <div className="fi-cta" style={buttonLayout}>
        <Button styleTokens={btnTokens} {...props}>{label}</Button>
      </div>
    );
  };

  return (
    <section
      className={`fi-section fi-stack-${stackOn}`}
      style={{ ...sectionStyle, overflowX: 'clip' }}
      aria-labelledby="fi-heading"
    >
      <div className="fi-shell" style={shellStyle}>
        {eyebrow && <p className="fi-eyebrow">{eyebrow}</p>}
        {heading && <h2 id="fi-heading" className="fi-heading" style={{ color: hx(titleColor) }}>{heading}</h2>}
        {subheading && <p className="fi-subheading" style={{ color: hx(subtitleColor) }}>{subheading}</p>}

        <div className="fi-card" style={cardStyle}>
          <div className="fi-grid">
            {/* IMAGE (responsive + loading placeholder + fallback) */}
            {(() => {
              const chosen = finalImage;
              const wrapStyle = imgWrapStyle;

              if (!chosen) {
                return (
                  <div className="fi-media" style={wrapStyle}>
                    <div className="fi-media-inner" style={{ display: 'grid', placeItems: 'center', minHeight: 180, opacity: 0.7 }}>
                      <span style={{ fontSize: 14 }}>No image available</span>
                    </div>
                  </div>
                );
              }

              const base = chosen.url.split('?')[0];
              const src = `${base}?auto=format`;
              const srcSet = [320, 480, 768, 1200].map(w => `${base}?w=${w}&auto=format ${w}w`).join(', ');

              return (
                <div className="fi-media" style={wrapStyle}>
                  <div className="fi-media-inner" style={{ position: 'relative' }}>
                    {!imgLoaded && (
                      <div
                        aria-hidden
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(0,0,0,0.05)',
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: 12,
                          color: 'rgba(0,0,0,0.5)'
                        }}
                      >
                        loading…
                      </div>
                    )}
                    <img
                      src={src}
                      srcSet={srcSet}
                      sizes="(max-width: 768px) 100vw, 420px"
                      alt={chosen.alt || ''}
                      loading="lazy"
                      decoding="async"
                      onLoad={() => setImgLoaded(true)}
                      style={{
                        display: 'block',
                        width: 'auto',        // 👈 natural width
                        maxWidth: '100%',     // 👈 never overflow the column
                        height: 'auto',
                        marginInline: 'auto', // center if narrower than column
                      }}
                    />
                  </div>
                </div>
              );
            })()}

            <div className="fi-details">
              {product?.name && (
                <h3 className="fi-title" style={{ color: hx(titleColor) }}>
                  {product.name}
                </h3>
              )}

              {product?.description && (
                <div className="fi-desc" style={{ color: hx(textColor) }}>
                  <PortableText value={product.description} />
                </div>
              )}

              {priceNode()}

              <div className="fi-cta-row equal">
                {renderButton(primaryButton)}
                {renderButton(secondaryButton)}
              </div>

              {disclaimer && <small className="fi-footnote" style={{ color: hx(textColor) }}>{disclaimer}</small>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}