import type { Element, Eyes, Form, Mouth, Shape } from './types.js';

/** Every list a seed picks from. While Sprite is a Preview style, these may change in a minor. */
export const ELEMENTS: readonly Element[] = Object.freeze(['fire', 'water', 'earth', 'wind', 'space']);
/** Each element's two forms. */
export const FORMS: Readonly<Record<Element, readonly [Form, Form]>> = Object.freeze({
  fire: ['flame', 'wisp'],
  water: ['drop', 'bubble'],
  earth: ['boulder', 'crystal'],
  wind: ['puff', 'tornado'],
  space: ['planet', 'star'],
});
export const EYES: readonly Eyes[] = Object.freeze(['dots', 'tiny', 'round', 'happy', 'sleepy', 'wink']);
export const MOUTHS: readonly Mouth[] = Object.freeze(['none', 'dot', 'smile', 'grin']);
/** Every cell shape. Sprites are drawn in squares unless asked otherwise. */
export const SHAPES: readonly Shape[] = Object.freeze(['square', 'circle', 'triangle', 'diamond']);
