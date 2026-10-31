import { drawGrid } from '../../src/styles/beastie/grid/index.js';
import { PALETTES } from '../../src/styles/beastie/palettes.js';
import { traits } from '../../src/styles/beastie/traits.js';
import type { BeastieTraits, Palette } from '../../src/styles/beastie/types.js';
import type { Kind } from './art.js';

/** Beasties, now in the package as seedkin/beastie; the lab draws them from there. */
export const monster: Kind<BeastieTraits> = {
  name: 'Beastie',
  traits,
  draw: drawGrid,
  palette: (t): Palette => PALETTES[t.palette] as Palette,
  shape: (t) => t.shape,
  describe: (t) =>
    [t.body, `${t.eyes} eye${t.eyes === 'one' ? '' : 's'}`, t.mouth, t.top, t.sides]
      .filter((s) => s !== 'none')
      .join(' · '),
};
