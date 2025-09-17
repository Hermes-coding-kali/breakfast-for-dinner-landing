import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Cart item shape (JSDoc for IntelliSense)
 * @typedef {Object} CartItem
 * @property {string} _id               Sanity document id
 * @property {string} title             Normalized: Sanity `name` or `title`
 * @property {any}    mainImage         Normalized: first image object (for urlFor)
 * @property {number} price             Unit price (from Stripe price lookup)
 * @property {string} currency          ISO currency (e.g. "CAD")
 * @property {number} quantity
 */

/**
 * Normalize a Sanity product into our cart item shape
 * Works with your schema: name, images[], stripe.stripePriceId
 */
function normalizeProductToCartItem(product) {
  return {
    _id: product._id,
    title: product.name || product.title || 'Product',
    // prefer provided mainImage, fallback to first images[] entry
    mainImage: product.mainImage || product.images?.[0] || null,
    price: typeof product.price === 'number' ? product.price : 0,
    currency: (product.currency || 'CAD').toUpperCase(),
    quantity: 1,
  };
}

export const useCartStore = create(
  persist(
    (set, get) => ({
      /** @type {CartItem[]} */
      items: [],
      isOpen: false,

      // UI controls
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      // Core actions
      addToCart: (product) => {
        const id = product._id;
        if (!id) return;
        const existing = get().items.find((i) => i._id === id);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i._id === id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({ items: [...get().items, normalizeProductToCartItem(product)] });
        }
        // optionally open the cart when adding
        set({ isOpen: true });
      },

      removeFromCart: (productId) =>
        set({ items: get().items.filter((i) => i._id !== productId) }),

      updateQuantity: (productId, quantity) => {
        const q = Math.max(0, Number(quantity) || 0);
        if (q === 0) {
          set({ items: get().items.filter((i) => i._id !== productId) });
        } else {
          set({
            items: get().items.map((i) =>
              i._id === productId ? { ...i, quantity: q } : i
            ),
          });
        }
      },

      clearCart: () => set({ items: [] }),

      // Selectors
      getTotalItems: () => get().items.reduce((t, i) => t + i.quantity, 0),
      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0),
      getCurrency: () => (get().items[0]?.currency || 'CAD').toUpperCase(),
    }),
    {
      name: 'breakfast-for-dinner-cart',
      // Only persist data, not functions
      partialize: (state) => ({ items: state.items, isOpen: state.isOpen }),
      version: 1,
    }
  )
);
