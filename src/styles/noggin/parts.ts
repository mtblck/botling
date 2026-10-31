import type { Eyes, Eyewear, Facial, Hair, Headwear, Mouth, Shape } from './types.js';

/** Every list a seed picks from. Changing one changes existing Noggins. */
export const HAIRS: readonly Hair[] = Object.freeze([
  'bald',
  'buzz',
  'short',
  'spiky',
  'bob',
  'long',
  'bun',
  'mohawk',
  'curly',
  'sidepart',
  'afro',
  'locs',
]);
export const EYES: readonly Eyes[] = Object.freeze(['dot', 'tall', 'happy', 'wink', 'closed']);
export const MOUTHS: readonly Mouth[] = Object.freeze(['smile', 'line', 'open', 'smirk']);
export const FACIAL: readonly Facial[] = Object.freeze(['none', 'mustache', 'beard']);
export const EYEWEAR: readonly Eyewear[] = Object.freeze(['none', 'glasses', 'shades']);
export const HEADWEAR: readonly Headwear[] = Object.freeze(['none', 'beanie', 'earring', 'headband', 'headscarf']);
/** Cell shapes a seed picks from; squares come up twice as often. */
export const SHAPE_ODDS: readonly Shape[] = Object.freeze(['square', 'circle', 'square']);
/** Every cell shape a caller can ask for. */
export const SHAPES: readonly Shape[] = Object.freeze(['square', 'circle', 'triangle', 'diamond']);
