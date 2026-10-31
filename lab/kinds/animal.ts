import { drawGrid } from '../../src/styles/snoot/grid/index.js';
import { PALETTES } from '../../src/styles/snoot/palettes.js';
import { traits } from '../../src/styles/snoot/traits.js';
import type { Palette, SnootTraits } from '../../src/styles/snoot/types.js';
import type { Kind } from './art.js';

/** Snoots, now in the package as seedkin/snoot; the lab draws them from there. */
export const animal: Kind<SnootTraits> = {
  name: 'Snoot',
  traits,
  draw: drawGrid,
  palette: (t): Palette => PALETTES[t.palette] as Palette,
  shape: (t) => t.shape,
  describe: (t) => [t.species, t.eyes, t.marking, t.extra].filter((s) => s !== 'none').join(' · '),
};
