/**
 * Pieces shown in the film, with their prices from the store (Shopify Admin, CAD, 2026-10-11).
 * Prices change: update them here, then re-render.
 */
export const PRODUCTS = {
  alphaSv: { name: "Arc'teryx Alpha SV Jacket", image: 'products/alpha-sv.png', price: 279.99 },
  gridFleece: { name: "Arc'teryx Grid Fleece Half-Zip", image: 'products/grid-fleece.png', price: 79.99 },
  macai: { name: "Arc'teryx Macai Jacket", image: 'products/macai.png', price: 369.99 },
} as const;

/** The store's own format on product cards: "$279.99", with the currency named once in the film. */
export const formatPrice = (amount: number) => `$${amount.toFixed(2)} CAD`;
