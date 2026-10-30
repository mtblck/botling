import { createRng, maybePick, pick } from '../../src/core/random.js';
import type { Palette, Shape } from '../../src/styles/botling/types.js';
import { type Canvas, createCanvas, type Kind, Role, stamp } from './art.js';
import { SCALES } from './palettes.js';

/**
 * Each species drawn in profile, facing right, 15 columns wide. `eye` is the
 * eye cell and `crown` the top of the head, where a hat goes.
 */
const SPECIES = {
  rex: {
    art: [
      '...............',
      '......SSSSSSS..',
      '.....BBBBBBBBB.',
      '.....BBBBBBBBBB',
      '.....BBBBBBBBBB',
      '.....BBBBBBBBBB',
      '.....BBBBSCSCSC',
      '.....BBBBCCCCC.',
      '.....BBBBBBB...',
      '....BBBBBC.....',
      '...BBBBBBCSS...',
      '..BBBBBBBC.S...',
      '..BBBBBBBC.....',
      '.BBBBBBBBC.....',
      '.BBBBBBBBC.....',
    ],
    eye: [9, 3],
    crown: [10, 1],
  },
  trike: {
    art: [
      '...............',
      '..AA...........',
      '.ASSA.....C....',
      '.ASSSA...C.....',
      '.ASSSSBBC......',
      '.ASSSBBBBBB....',
      '..ASBBBBBBBBC..',
      '..ASBBBBBBBBBC.',
      '...ABBBBBBBBBBB',
      '....BBBBBBBBBS.',
      '....BBBBBSSS...',
      '...BBBBBB......',
      '..BBBBBBB......',
      '.BBBBBBBBB.....',
      'BBBBBBBBBB.....',
    ],
    eye: [7, 6],
    crown: [7, 4],
  },
  stego: {
    art: [
      '...............',
      '...............',
      '...............',
      '.....A.........',
      '...A.AA.A......',
      '..AAAAAAAA.....',
      '.SBBBBBBBBS....',
      'SBBBBBBBBBBBBB.',
      'SBBBBBBBBBBBBBB',
      '.BBBBBBBBBBBBS.',
      '..CCCCCCCCBB...',
      '..BBB...BBB....',
      '..BBB...BBB....',
      '..SSS...SSS....',
      '...............',
    ],
    eye: [12, 7],
    crown: [12, 6],
  },
  bronto: {
    art: [
      '...............',
      '..........BBBB.',
      '.........BBBBBB',
      '.........BBBBSS',
      '.........BBB...',
      '........BBB....',
      '........BBB....',
      '.......BBB.....',
      '.......BBB.....',
      '......BBBB.....',
      '.....BBBBB.....',
      '...BBBBBBBB....',
      '.BBBBBBBBBBB...',
      'BBBBBBBBBBBBB..',
      'BBBBBBBBBBBBB..',
    ],
    eye: [12, 2],
    crown: [12, 1],
  },
  ptero: {
    art: [
      '...............',
      '.AAA...........',
      '..AAAB.........',
      '...ABBBB.......',
      '....BBBBBB.....',
      '....BBBBBBBBBBB',
      '.....BBBBSSSSS.',
      '......BBB......',
      '......BBB......',
      '.....BBBB......',
      '....BBBBBB.....',
      'SSSBBBBBBBBSSS.',
      '.SSBBBBBBBBSS..',
      '...BBBBBBBB....',
      '...BBBBBBBB....',
    ],
    eye: [7, 4],
    crown: [7, 3],
  },
} as const;
type Species = keyof typeof SPECIES;

const NAMES = Object.keys(SPECIES) as Species[];
const EYES = ['dot', 'angry', 'sleepy', 'shine'] as const;
const HATS = ['none', 'party', 'bow', 'crown'] as const;

export interface DinoTraits {
  scales: number;
  species: Species;
  eyes: (typeof EYES)[number];
  hat: (typeof HATS)[number];
  /** Faces left instead of right. */
  flip: boolean;
  /** Seed for the spot positions, or 0 for none. */
  spots: number;
  shape: Shape;
}

function traits(seed: string): DinoTraits {
  const rng = createRng(`dino:${seed}`);
  return {
    scales: Math.floor(rng() * SCALES.length),
    species: pick(rng, NAMES),
    eyes: pick(rng, EYES),
    hat: maybePick(rng, 0.3, HATS),
    flip: rng() < 0.5,
    spots: rng() < 0.5 ? 1 + Math.floor(rng() * 1e6) : 0,
    shape: pick(rng, ['square', 'square', 'circle', 'diamond'] as const),
  };
}

function draw(t: DinoTraits): Canvas {
  const c = createCanvas();
  const s = SPECIES[t.species];
  stamp(c, s.art, 0, 0);
  if (t.spots) {
    const rng = createRng(String(t.spots));
    const body: [number, number][] = [];
    c.cells.forEach((row, y) => {
      row.forEach((r, x) => {
        if (r === Role.Body && y > s.eye[1] + 1) body.push([x, y]);
      });
    });
    for (let i = 0; i < 4 && body.length; i++) {
      const [x, y] = body.splice(Math.floor(rng() * body.length), 1)[0] as [number, number];
      c.paint(x, y, Role.Accent);
    }
  }
  const [ex, ey] = s.eye;
  if (t.eyes === 'dot') c.paint(ex, ey, Role.Glow);
  else if (t.eyes === 'angry') {
    c.paint(ex, ey, Role.Glow);
    c.paint(ex - 1, ey - 1, Role.Shade);
    c.paint(ex, ey - 1, Role.Shade);
  } else if (t.eyes === 'sleepy') {
    c.paint(ex, ey, Role.Glow);
    c.paint(ex - 1, ey, Role.Glow);
  } else {
    c.paint(ex, ey, Role.Glow);
    c.paint(ex, ey + 1, Role.Glow);
  }
  const [hx, hy] = s.crown;
  if (t.hat === 'party') stamp(c, ['.A.', '.A.', 'AAA'], hx - 1, hy - 3);
  else if (t.hat === 'bow') stamp(c, ['A.A', 'AAA'], hx - 1, hy - 1);
  else if (t.hat === 'crown') stamp(c, ['A.A.A', 'AAAAA'], hx - 2, hy - 2);
  if (t.flip) {
    for (const row of c.cells) row.reverse();
    for (const row of c.parts) row.reverse();
  }
  return c;
}

/** Dinosaurs in profile: rex, triceratops, stegosaurus, brontosaurus and pterodactyl. */
export const dino: Kind<DinoTraits> = {
  name: 'Dinosaur',
  traits,
  draw,
  palette: (t): Palette => SCALES[t.scales] as Palette,
  shape: (t) => t.shape,
  describe: (t) => [t.species, t.eyes, t.hat, t.spots ? 'spots' : 'none'].filter((s) => s !== 'none').join(' · '),
};
