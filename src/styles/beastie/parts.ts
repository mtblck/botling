import type { Body, Eyes, Mouth, Shape, Sides, Top } from './types.js';

/** Every list a seed picks from. Changing one changes existing Beasties. */
export const BODIES: readonly Body[] = Object.freeze(['blob', 'tall', 'wide', 'ghost', 'box']);
export const EYES: readonly Eyes[] = Object.freeze(['one', 'two', 'three', 'stalks', 'tiny']);
export const MOUTHS: readonly Mouth[] = Object.freeze(['fangs', 'toothy', 'grin', 'o', 'tongue']);
export const TOPS: readonly Top[] = Object.freeze(['none', 'horns', 'antennae', 'spikes', 'tuft']);
export const SIDES: readonly Sides[] = Object.freeze(['none', 'arms', 'wings']);
/** Every cell shape; a seed picks any of them. */
export const SHAPES: readonly Shape[] = Object.freeze(['square', 'circle', 'triangle', 'diamond']);
