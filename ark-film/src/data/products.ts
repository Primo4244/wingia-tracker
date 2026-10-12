/**
 * Pieces shown in the films, with their prices from the store (Shopify Admin, CAD, 2026-10-11).
 * Prices change: update them here, then re-render.
 */
export const PRODUCTS = {
  alphaSv: { name: "Arc'teryx Alpha SV Jacket", image: 'products/alpha-sv.png', price: 279.99 },
  betaSl: { name: "Arc'teryx Beta SL Jacket", image: 'products/beta-sl.png', price: 219.99 },
  macai: { name: "Arc'teryx Macai Jacket", image: 'products/macai.png', price: 369.99 },
  thorium: { name: "Arc'teryx Thorium Hoody", image: 'products/thorium.png', price: 159.99 },
  downVest: { name: "Arc'teryx Down Vest", image: 'products/down-vest.png', price: 99.99 },
  gridFleece: { name: "Arc'teryx Grid Fleece Half-Zip", image: 'products/grid-fleece.png', price: 79.99 },
  toque: { name: "Arc'teryx Bird Toque", colour: 'Powder Pink', image: 'products/toque-pink.png', price: 39.99 },
} as const;

/** Other colours of the Bird toque, for the essentials rail (the site shows four). */
export const TOQUE_COLOURS = [
  { colour: 'Black / Grey', image: 'products/toque-black.png' },
  { colour: 'Navy / White', image: 'products/toque.png' },
  { colour: 'Off-White / Grey', image: 'products/toque-offwhite.png' },
] as const;

/** The store's own format on product cards: "$279.99", with the currency named. */
export const formatPrice = (amount: number) => `$${amount.toFixed(2)} CAD`;
