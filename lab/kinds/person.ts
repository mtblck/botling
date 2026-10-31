import { drawGrid } from '../../src/styles/noggin/grid/index.js';
import { paletteFor } from '../../src/styles/noggin/palettes.js';
import { traits } from '../../src/styles/noggin/traits.js';
import type { NogginTraits, Palette } from '../../src/styles/noggin/types.js';
import type { Kind } from './art.js';

/** Noggins, now in the package as seedkin/noggin; the lab draws them from there. */
export const person: Kind<NogginTraits> = {
  name: 'Noggin',
  traits,
  draw: drawGrid,
  palette: (t): Palette => paletteFor(t.palette, t.skin, t.hairColour),
  shape: (t) => t.shape,
  describe: (t) => [t.hair, t.eyes, t.mouth, t.facial, t.eyewear, t.headwear].filter((s) => s !== 'none').join(' · '),
};
