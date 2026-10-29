import type { Eyes, Head, Mouth, Shape, Sides, Top } from './types.js';

// A seed picks by index over each list's length, so any change to these lists
// (even appending) changes existing robots and is a major version.
export const HEADS: readonly Head[] = ['box', 'rounded', 'dome', 'tv', 'capsule', 'bucket', 'wedge'];
export const EYES: readonly Eyes[] = [
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
];
export const MOUTHS: readonly Mouth[] = ['line', 'grille', 'smile', 'teeth', 'dots', 'speaker', 'none', 'o'];
export const TOPS: readonly Top[] = ['none', 'antenna', 'twin', 'horns', 'fin', 'bolt', 'dish'];
export const SIDES: readonly Sides[] = ['none', 'bolts', 'ears', 'handles'];
export const SHAPES: readonly Shape[] = ['square', 'circle', 'triangle', 'diamond'];
