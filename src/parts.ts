import type { Accessory, Eyes, Head, Mouth, Pattern, Quirk, Shape, Sides, Top } from './types.js';

// A seed picks by index over each list's length, so any change to these lists
// (even appending) changes existing robots and is a major version. Frozen, so
// an app can't change them at runtime and redraw every robot.
export const HEADS: readonly Head[] = Object.freeze(['box', 'rounded', 'dome', 'tv', 'capsule', 'bucket', 'wedge']);
export const EYES: readonly Eyes[] = Object.freeze([
  'dot',
  'block',
  'tall',
  'slit',
  'visor',
  'cyclops',
  'ring',
  'cross',
  'sleepy',
  'mismatch',
  'happy',
  'wink',
  'angry',
  'surprised',
]);
export const MOUTHS: readonly Mouth[] = Object.freeze([
  'line',
  'grille',
  'smile',
  'teeth',
  'dots',
  'speaker',
  'none',
  'o',
  'frown',
  'grin',
  'zigzag',
]);
export const TOPS: readonly Top[] = Object.freeze(['none', 'antenna', 'twin', 'horns', 'fin', 'bolt', 'dish']);
export const SIDES: readonly Sides[] = Object.freeze(['none', 'bolts', 'ears', 'handles']);
export const SHAPES: readonly Shape[] = Object.freeze(['square', 'circle', 'triangle', 'diamond']);
// 'none' comes first in these three: a seed draws it unless a roll says
// otherwise, then picks from the rest (see maybePick).
export const PATTERNS: readonly Pattern[] = Object.freeze(['none', 'stripe', 'rivets', 'chin']);
export const QUIRKS: readonly Quirk[] = Object.freeze(['none', 'ear', 'dent', 'patch', 'antenna']);
export const ACCESSORIES: readonly Accessory[] = Object.freeze(['none', 'headphones', 'visor', 'bow', 'cap']);
