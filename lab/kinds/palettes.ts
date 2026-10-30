import type { Palette } from '../../src/core/types.js';

const p = (name: string, ...c: [string, string, string, string, string, string, string]): Palette => {
  const [bg, grid, body, shade, screen, glow, accent] = c;
  return { name, bg, grid, body, shade, screen, glow, accent };
};

/** Animal coats. Body is fur, shade the ears and edge, screen the muzzle, glow the eyes and nose, accent inner ears and cheeks. */
export const COATS: readonly Palette[] = [
  p('Ginger', '#2b1d14', '#3a2a1e', '#e8873a', '#b85f22', '#fbe3c4', '#1e140d', '#ff9fae'),
  p('Charcoal', '#e9ecf2', '#d8dce6', '#4a4e5a', '#2e3139', '#c9ccd6', '#f5d547', '#ff8fa3'),
  p('Snow', '#1b2433', '#263246', '#f2f2f0', '#b9bec6', '#ffd9e0', '#1b2433', '#ff8fab'),
  p('Cocoa', '#f6efe6', '#ece2d3', '#8a5a3b', '#5e3b24', '#e2c29f', '#1f130b', '#ff8f8f'),
  p('Honey', '#14202a', '#1f2e3b', '#f0b73e', '#c0841a', '#fff0c9', '#2a1a08', '#ff7a59'),
  p('Mint', '#fdf6ec', '#f1e6d6', '#7fd1b9', '#4fa98f', '#e8fff6', '#173a31', '#ff8fab'),
  p('Lilac', '#1a1626', '#272137', '#b9a3e3', '#8e74c9', '#efe7ff', '#1a1626', '#ffb3c7'),
  p('Stone', '#fff4d6', '#f5e6bf', '#9aa3ad', '#6f7882', '#e9edf1', '#16191d', '#ff8fa3'),
];

/** Clothes and backgrounds for people: screen is the shirt, accent the cheeks and glasses. */
export const OUTFITS: readonly Omit<Palette, 'body' | 'shade' | 'glow'>[] = [
  { name: 'Teal', bg: '#14202a', grid: '#1f2e3b', screen: '#2bb3a3', accent: '#ff8a7a' },
  { name: 'Coral', bg: '#fdf1e7', grid: '#f3e1d1', screen: '#ff6f61', accent: '#ff8a7a' },
  { name: 'Navy', bg: '#e8eef8', grid: '#d6e0f0', screen: '#2c3e75', accent: '#ff8a9a' },
  { name: 'Mustard', bg: '#1d1a12', grid: '#2c271b', screen: '#e0a526', accent: '#ff8a7a' },
  { name: 'Violet', bg: '#17142a', grid: '#241f3d', screen: '#7c5cd6', accent: '#ff9ab0' },
  { name: 'Leaf', bg: '#f4f8ec', grid: '#e4eed4', screen: '#4f9a4a', accent: '#ff8a7a' },
];

/** Skin tones, each with the eye and mouth colour that reads on it. */
export const SKIN: readonly { body: string; glow: string }[] = [
  { body: '#ffdcc8', glow: '#3a2418' },
  { body: '#f2c49b', glow: '#3a2418' },
  { body: '#d9a06b', glow: '#2a180e' },
  { body: '#b97a48', glow: '#1c0f08' },
  { body: '#8f5a34', glow: '#140a05' },
  { body: '#6e4426', glow: '#0d0603' },
];

export const HAIR: readonly string[] = ['#1f1a17', '#5a3825', '#a0482a', '#e6c15a', '#c4c4cc', '#ff7eb6', '#5a8dee'];

/** Monster skins. Glow is eye whites and teeth, screen the pupils and mouth. */
export const HIDES: readonly Palette[] = [
  p('Grape', '#151022', '#221a35', '#8e5cf0', '#6438c4', '#1a0f1f', '#ffffff', '#ffd166'),
  p('Slime', '#0f1a12', '#1a2b1f', '#7bd74a', '#4f9e2c', '#14200c', '#ffffff', '#ff5fa2'),
  p('Pumpkin', '#fff3e4', '#f6e2cb', '#ff8a2a', '#d0620d', '#2a1305', '#ffffff', '#5a2ea6'),
  p('Sky', '#101a2b', '#1a2840', '#4fa7ff', '#2c76d1', '#0b1426', '#ffffff', '#ffe066'),
  p('Bubblegum', '#fff0f6', '#fde0ec', '#ff7ab8', '#e04892', '#2a0b1a', '#ffffff', '#6ee7d8'),
  p('Lagoon', '#0e1c1c', '#183030', '#2fc4b2', '#1d8f82', '#071414', '#ffffff', '#ff8a5c'),
  p('Chilli', '#1d1010', '#2e1a1a', '#e5484d', '#a92b30', '#1a0607', '#fff2d9', '#ffd166'),
  p('Banana', '#14152a', '#20223f', '#ffd84d', '#d9a91c', '#2a1f05', '#ffffff', '#ff6f61'),
];

/** Dinosaur hides. Shade is the back and mouth line, screen the belly and teeth, accent spots, plates and frills. */
export const SCALES: readonly Palette[] = [
  p('Fern', '#14201a', '#1e2f26', '#5cb85c', '#3d8b3d', '#d9f2b4', '#10180f', '#f2c14e'),
  p('Lagoon', '#fdf6ec', '#f1e6d6', '#3fb7a8', '#24857a', '#d8f5ef', '#0e2421', '#ff8a5c'),
  p('Sunset', '#1d1412', '#2e211d', '#ff8a3d', '#d0601a', '#ffe1c2', '#1d1412', '#7b5cff'),
  p('Berry', '#f4eefc', '#e6dcf6', '#8f5ad8', '#6a3cb0', '#eadcff', '#170c26', '#ffd166'),
  p('Ocean', '#0f1726', '#1a253b', '#4a8be8', '#2e63b8', '#d6e6ff', '#0b1220', '#ff6fa8'),
  p('Lime', '#1b1d10', '#2a2d1a', '#b8d63c', '#86a121', '#f2fbcf', '#161a06', '#ff6f61'),
  p('Rose', '#fff2f2', '#fbe1e1', '#ff7a8a', '#d9475b', '#ffe3e7', '#2a0d12', '#3fb7a8'),
  p('Rust', '#eef3f6', '#dfe7ec', '#b5562e', '#8a3c1d', '#f6d6c2', '#1a0d06', '#3fb7a8'),
];
