import type { Palette } from '../../src/core/types.js';
import { drawGrid as drawRobot } from '../../src/styles/botling/grid/index.js';
import { PALETTES as ROBOT_PALETTES } from '../../src/styles/botling/palettes.js';
import { traits as robotTraits } from '../../src/styles/botling/traits.js';
import type { Traits } from '../../src/styles/botling/types.js';
import { animal } from '../kinds/animal.js';
import type { Kind } from '../kinds/art.js';
import { monster } from '../kinds/monster.js';
import { person } from '../kinds/person.js';

/** Botling as a lab Kind. A robot without a screen cuts its face out in the screen colour. */
const robot: Kind<Traits> = {
  name: 'Botling',
  traits: robotTraits,
  draw: drawRobot,
  palette: (t) => {
    const p = ROBOT_PALETTES[t.palette] as Palette;
    return t.hasScreen ? p : { ...p, glow: p.screen };
  },
  shape: (t) => t.shape,
  describe: (t) => `${t.head} head`,
};

/** The four families, in site order, with the name each goes by. */
export const FAMILIES: readonly { name: string; kind: Kind<never> }[] = [
  { name: 'Botling', kind: robot as unknown as Kind<never> },
  { name: 'Snoot', kind: animal as unknown as Kind<never> },
  { name: 'Beastie', kind: monster as unknown as Kind<never> },
  { name: 'Noggin', kind: person as unknown as Kind<never> },
];
