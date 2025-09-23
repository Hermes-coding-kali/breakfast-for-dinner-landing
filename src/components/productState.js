// src/components/productState.js

function getProductId(raw = {}) {
    return raw._id || raw.id || raw._ref || raw.productId || null;
  }
  
  export function normalizeProduct(raw = {}) {
    const normalized = {
      _id: getProductId(raw),                  // single canonical id
      id: getProductId(raw),                   // alias for convenience
      title: raw.title || raw.name || 'Untitled Product',
      slug: raw.slug?.current || raw.slug || null,
      images: raw.images || (raw.mainImage ? [raw.mainImage] : []),
      description: raw.description || raw.body || null,
      // Keep Canadian defaults intact
      price:
        typeof raw.price === 'number'
          ? raw.price
          : raw.unit_amount
          ? Number(raw.unit_amount) / 100
          : null,
      currency: raw.currency || (raw.unit_amount ? 'USD' : 'CAD'),
      // optional flags if you use them
      presale: !!raw.presale,
      releaseDate: raw.releaseDate ? new Date(raw.releaseDate) : null,
      inStock:
        typeof raw.inStock === 'boolean'
          ? raw.inStock
          : (raw.inventory ?? 1) > 0,
      externalUrl: raw.externalUrl || null,
      stripePriceId:
        raw.stripePriceId || raw.priceId || raw.stripe?.stripePriceId || null,
    };
    return normalized;
  }
  
  export function deriveStatus(p) {
    const now = new Date();
    const isPresale =
      p.presale || (p.releaseDate && p.releaseDate.getTime() > now.getTime());
  
    return {
      isPresale,
      isAvailable: !!(p.inStock || isPresale),
      canCheckout: !!p._id, // checkout still expects an id
      missingPrice: !(typeof p.price === 'number'),
    };
  }
  