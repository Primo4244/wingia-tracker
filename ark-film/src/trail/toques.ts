/**
 * The 24 colours of the Arc'teryx Bird toque, from the store's variants (Shopify, 2026-10-11),
 * as crown colour and knit-graphic colour. Hex values are matched by eye to the packshots.
 */
export const TOQUE_VARIANTS: { name: string; crown: string; graphic: string }[] = [
  { name: 'Light Grey', crown: '#b9bdc2', graphic: '#e9eef2' },
  { name: 'Black / Grey', crown: '#1c1d20', graphic: '#8d9196' },
  { name: 'Yellow', crown: '#e2c234', graphic: '#f3eccd' },
  { name: 'Purple', crown: '#5b3f86', graphic: '#d8cfe6' },
  { name: 'Powder Pink', crown: '#d0848f', graphic: '#f3e6df' },
  { name: 'Blue / Yellow', crown: '#2f56b0', graphic: '#e8c93a' },
  { name: 'Orange', crown: '#e0672a', graphic: '#f6e3d2' },
  { name: 'Watermelon Red', crown: '#d8424f', graphic: '#f6dfe0' },
  { name: 'Dark Green', crown: '#2d4a37', graphic: '#cfd8cf' },
  { name: 'Black / White', crown: '#141518', graphic: '#eef0f2' },
  { name: 'Dark Grey', crown: '#45484d', graphic: '#a5a9ae' },
  { name: 'Khaki', crown: '#a59873', graphic: '#efe8d6' },
  { name: 'Blue', crown: '#2342a8', graphic: '#dfe6f6' },
  { name: 'Burgundy / Black', crown: '#6a2130', graphic: '#17171a' },
  { name: 'Lavender', crown: '#a99bd2', graphic: '#f1eef8' },
  { name: 'Wine / White', crown: '#7b2738', graphic: '#f2e9ea' },
  { name: 'Pink / White', crown: '#d27f8e', graphic: '#fbf3f1' },
  { name: 'Blue / White', crown: '#3d73c4', graphic: '#f1f5fb' },
  { name: 'Grey / Yellow', crown: '#8b8e93', graphic: '#e7c63c' },
  { name: 'Dark Red / White', crown: '#8c1f26', graphic: '#f5ecec' },
  { name: 'Fluorescent Green', crown: '#7ee03a', graphic: '#f1fbe8' },
  { name: 'Off-White / Grey', crown: '#e5e1d6', graphic: '#8e9196' },
  { name: 'Navy / White', crown: '#1b2440', graphic: '#eef0f4' },
  { name: 'Purple / Yellow', crown: '#4b2a78', graphic: '#e5c43a' },
];

export const PINK = TOQUE_VARIANTS.findIndex((v) => v.name === 'Powder Pink');

/** Order along the line: light, dark and vivid colours alternate so each toque reads. */
export const LINE_ORDER = [
  'Yellow', 'Navy / White', 'Watermelon Red', 'Light Grey', 'Blue', 'Orange', 'Black / White', 'Fluorescent Green',
  'Purple', 'Off-White / Grey', 'Blue / Yellow', 'Khaki', 'Dark Red / White', 'Lavender', 'Dark Green', 'Grey / Yellow',
  'Wine / White', 'Blue / White', 'Black / Grey', 'Purple / Yellow', 'Dark Grey', 'Pink / White', 'Burgundy / Black',
].map((name) => TOQUE_VARIANTS.findIndex((v) => v.name === name));
