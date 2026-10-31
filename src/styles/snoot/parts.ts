import type { Extra, Eyes, Marking, Shape, Species } from './types.js';

/** Every list a seed picks from. Changing one changes existing Snoots. */
export const SPECIES: readonly Species[] = Object.freeze([
  'cat',
  'fox',
  'bear',
  'bunny',
  'mouse',
  'dog',
  'panda',
  'owl',
  'frog',
  'pig',
]);
export const EYES: readonly Eyes[] = Object.freeze(['dot', 'tall', 'shine', 'sleepy', 'happy']);
export const MARKINGS: readonly Marking[] = Object.freeze(['none', 'stripes', 'patch', 'mask', 'spots']);
export const EXTRAS: readonly Extra[] = Object.freeze(['none', 'bow', 'flower', 'whiskers']);
/** Cell shapes a seed picks from; squares come up twice as often. */
export const SHAPE_ODDS: readonly Shape[] = Object.freeze(['square', 'circle', 'square', 'diamond']);
/** Every cell shape a caller can ask for. */
export const SHAPES: readonly Shape[] = Object.freeze(['square', 'circle', 'triangle', 'diamond']);
