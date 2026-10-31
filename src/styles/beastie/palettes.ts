import type { Palette } from './types.js';

const hide = (name: string, ...c: [string, string, string, string, string, string, string]): Palette => {
  const [bg, grid, body, shade, screen, glow, accent] = c;
  return { name, bg, grid, body, shade, screen, glow, accent };
};

/**
 * Beastie hides. Body is the hide, shade its edge, feet, horns and arms,
 * screen the mouth and pupils, glow the eye whites and teeth, accent spots,
 * wings and horn tips. A seed picks one by index over the list length.
 */
export const PALETTES: readonly Palette[] = Object.freeze(
  [
    hide('Grape', '#151022', '#221a35', '#8e5cf0', '#6438c4', '#1a0f1f', '#ffffff', '#ffd166'),
    hide('Slime', '#0f1a12', '#1a2b1f', '#7bd74a', '#4f9e2c', '#14200c', '#ffffff', '#ff5fa2'),
    hide('Pumpkin', '#fff3e4', '#f6e2cb', '#ff8a2a', '#d0620d', '#2a1305', '#ffffff', '#5a2ea6'),
    hide('Sky', '#101a2b', '#1a2840', '#4fa7ff', '#2c76d1', '#0b1426', '#ffffff', '#ffe066'),
    hide('Bubblegum', '#fff0f6', '#fde0ec', '#ff7ab8', '#e04892', '#2a0b1a', '#ffffff', '#6ee7d8'),
    hide('Lagoon', '#0e1c1c', '#183030', '#2fc4b2', '#1d8f82', '#071414', '#ffffff', '#ff8a5c'),
    hide('Chilli', '#1d1010', '#2e1a1a', '#e5484d', '#a92b30', '#1a0607', '#fff2d9', '#ffd166'),
    hide('Banana', '#14152a', '#20223f', '#ffd84d', '#d9a91c', '#2a1f05', '#ffffff', '#ff6f61'),
  ].map((p) => Object.freeze(p)),
);
