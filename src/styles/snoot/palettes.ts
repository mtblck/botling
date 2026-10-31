import type { Palette } from './types.js';

const coat = (name: string, ...c: [string, string, string, string, string, string, string]): Palette => {
  const [bg, grid, body, shade, screen, glow, accent] = c;
  return { name, bg, grid, body, shade, screen, glow, accent };
};

/**
 * Snoot coats. Body is the fur, shade the ears and edge, screen the muzzle,
 * glow the eyes and nose, accent inner ears, cheeks and bows. A seed picks
 * one by index over the list length.
 */
export const PALETTES: readonly Palette[] = Object.freeze(
  [
    coat('Ginger', '#2b1d14', '#3a2a1e', '#e8873a', '#b85f22', '#fbe3c4', '#1e140d', '#ff9fae'),
    coat('Charcoal', '#e9ecf2', '#d8dce6', '#4a4e5a', '#2e3139', '#c9ccd6', '#f5d547', '#ff8fa3'),
    coat('Snow', '#1b2433', '#263246', '#f2f2f0', '#b9bec6', '#ffd9e0', '#1b2433', '#ff8fab'),
    coat('Cocoa', '#f6efe6', '#ece2d3', '#8a5a3b', '#5e3b24', '#e2c29f', '#1f130b', '#ff8f8f'),
    coat('Honey', '#14202a', '#1f2e3b', '#f0b73e', '#c0841a', '#fff0c9', '#2a1a08', '#ff7a59'),
    coat('Mint', '#fdf6ec', '#f1e6d6', '#7fd1b9', '#4fa98f', '#e8fff6', '#173a31', '#ff8fab'),
    coat('Lilac', '#1a1626', '#272137', '#b9a3e3', '#8e74c9', '#efe7ff', '#1a1626', '#ffb3c7'),
    coat('Stone', '#fff4d6', '#f5e6bf', '#9aa3ad', '#6f7882', '#e9edf1', '#16191d', '#ff8fa3'),
    coat('Rose', '#1f1420', '#2e1f30', '#f4a7b9', '#d27891', '#ffe6ec', '#2a1219', '#e85d84'),
    coat('Sky', '#fff7ea', '#f3e8d4', '#8fc7f0', '#5b9bd1', '#eaf6ff', '#10243a', '#ff8fab'),
    coat('Sand', '#18222b', '#24313d', '#e6cfa3', '#c2a774', '#fff6e3', '#2b2012', '#ff8f8f'),
    coat('Midnight', '#eef1f8', '#dde3ef', '#3b4a78', '#27325a', '#c8d0ea', '#ffd166', '#ff9ab0'),
  ].map((p) => Object.freeze(p)),
);
