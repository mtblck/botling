import { createRng, int, maybePick, pick } from '../../src/core/random.js';
import type { Palette, Shape } from '../../src/styles/botling/types.js';
import { blob, type Canvas, createCanvas, type Kind, Role, stamp } from './art.js';
import { COATS } from './palettes.js';

const SPECIES = ['cat', 'fox', 'bear', 'bunny', 'mouse', 'dog', 'panda', 'owl', 'frog', 'pig'] as const;
const EYES = ['dot', 'tall', 'shine', 'sleepy', 'happy'] as const;
const MARKINGS = ['none', 'stripes', 'patch', 'mask', 'spots'] as const;
const EXTRAS = ['none', 'bow', 'flower', 'whiskers'] as const;
const SHAPES: readonly Shape[] = ['square', 'circle', 'square', 'diamond'];

export interface AnimalTraits {
  coat: number;
  species: (typeof SPECIES)[number];
  eyes: (typeof EYES)[number];
  marking: (typeof MARKINGS)[number];
  extra: (typeof EXTRAS)[number];
  halfWidth: number;
  tall: boolean;
  hasCheeks: boolean;
  shape: Shape;
}

/** Ears for each species, as left-half art whose last row sits on the head's top row. Outer edge first. */
const EARS: Record<string, { art: string[]; ox: number }> = {
  cat: { art: ['S..', 'SS.', 'SAS'], ox: 0 },
  fox: { art: ['S...', 'SS..', 'SAS.', 'SAAS'], ox: 0 },
  bear: { art: ['.SS.', 'SAAS'], ox: 0 },
  panda: { art: ['.SS.', 'SSSS'], ox: 0 },
  mouse: { art: ['.SSS.', 'SAAAS', 'SAAAS'], ox: -2 },
  bunny: { art: ['.S.', 'SAS', 'SAS', 'SAS', 'SAS'], ox: 1 },
  owl: { art: ['S.', 'SS'], ox: 0 },
  pig: { art: ['SS', 'SA'], ox: 0 },
  frog: { art: ['.BBB.', 'BCGCB'], ox: 1 },
};

/**
 * Picks every trait for an animal.
 *
 * @param seed - Any string
 * @returns The animal's traits
 */
function traits(seed: string): AnimalTraits {
  const rng = createRng(`animal:${seed}`);
  return {
    coat: Math.floor(rng() * COATS.length),
    species: pick(rng, SPECIES),
    eyes: pick(rng, EYES),
    marking: maybePick(rng, 0.4, MARKINGS),
    extra: maybePick(rng, 0.3, EXTRAS),
    halfWidth: int(rng, 4, 5),
    tall: rng() < 0.5,
    hasCheeks: rng() < 0.4,
    shape: pick(rng, SHAPES),
  };
}

/** Paints art left of centre and mirrors it, anchored at a column measured from the head's outer edge. */
function ears(c: Canvas, art: readonly string[], col: number, bottomRow: number): void {
  const top = bottomRow - art.length + 1;
  stamp(c, art, col, top);
  stamp(c, art, col, top, true);
}

function draw(t: AnimalTraits): Canvas {
  const c = createCanvas();
  const hw = t.species === 'frog' ? 6 : t.halfWidth;
  const top = 5;
  const rows =
    t.species === 'frog'
      ? [hw - 1, hw, hw, hw, hw, hw - 1]
      : [hw - 1, hw, hw, hw, ...(t.tall ? [hw] : []), hw, hw - 1, hw - 2];
  const bottom = top + rows.length - 1;
  const left = c.center - hw;
  blob(c, top, rows, Role.Body, Role.Shade);
  const ear = EARS[t.species];
  if (ear) ears(c, ear.art, left + ear.ox, top);
  if (t.species === 'dog') ears(c, ['SSS', 'SSS', 'SS.', 'SS.', 'SS.', '.S.'], left - 1, top + 4);
  const eyeRow = top + 2;
  const eyeX = Math.min(hw - 2, 2 + (hw > 4 ? 1 : 0));
  marking(c, t, top, eyeRow, eyeX, hw);
  if (t.species === 'owl')
    for (const dx of [eyeX - 1, eyeX, eyeX + 1])
      for (let y = eyeRow - 1; y <= eyeRow + 1; y++) c.mirror(dx, y, Role.Screen);
  if (t.species !== 'frog') eyes(c, t, eyeRow, eyeX);
  face(c, t, eyeRow + 2, hw, bottom);
  if (t.hasCheeks && t.species !== 'owl') c.mirror(eyeX + 1, eyeRow + 2, Role.Accent);
  extra(c, t, top, hw, eyeRow);
  return c;
}

function eyes(c: Canvas, t: AnimalTraits, y: number, x: number): void {
  const g = (dx: number, row: number, role: Role = Role.Glow): void => c.mirror(dx, row, role);
  switch (t.eyes) {
    case 'dot':
      g(x, y);
      break;
    case 'tall':
      g(x, y);
      g(x, y + 1);
      break;
    case 'shine':
      g(x, y);
      g(x - 1, y);
      g(x, y + 1);
      g(x - 1, y + 1);
      g(x, y, Role.Screen);
      break;
    case 'sleepy':
      g(x, y + 1);
      g(x - 1, y + 1);
      break;
    case 'happy':
      g(x, y);
      g(x - 1, y + 1);
      g(x + 1, y + 1);
      break;
  }
}

function marking(c: Canvas, t: AnimalTraits, top: number, eyeRow: number, eyeX: number, hw: number): void {
  const panda = t.species === 'panda';
  if (panda || t.marking === 'mask') {
    for (let dx = eyeX - 1; dx <= eyeX + 1; dx++) for (const y of [eyeRow, eyeRow + 1]) c.mirror(dx, y, Role.Shade);
    if (!panda) for (let dx = 0; dx <= eyeX - 2; dx++) c.mirror(dx, eyeRow, Role.Shade);
    return;
  }
  if (t.marking === 'stripes') {
    c.paint(c.center, top, Role.Shade);
    c.paint(c.center, top + 1, Role.Shade);
    c.mirror(2, top, Role.Shade);
    c.mirror(hw - 1, eyeRow + 1, Role.Shade);
    c.mirror(hw - 1, eyeRow + 3, Role.Shade);
  } else if (t.marking === 'patch') {
    for (let dx = eyeX - 1; dx <= eyeX + 1; dx++)
      for (let y = eyeRow - 1; y <= eyeRow + 1; y++) c.paint(c.center - dx, y, Role.Shade);
  } else if (t.marking === 'spots') {
    c.paint(c.center + 1, top + 1, Role.Shade);
    c.paint(c.center - hw + 1, eyeRow + 2, Role.Shade);
    c.paint(c.center + 3, top, Role.Shade);
  }
}

function face(c: Canvas, t: AnimalTraits, y: number, hw: number, bottom: number): void {
  const m = (dx: number, row: number, role: Role): void => c.mirror(dx, row, role);
  switch (t.species) {
    case 'owl':
      m(0, y - 1, Role.Accent);
      m(0, y, Role.Accent);
      return;
    case 'pig':
      m(0, y, Role.Accent);
      m(1, y, Role.Accent);
      m(0, y + 1, Role.Accent);
      m(1, y + 1, Role.Accent);
      m(1, y, Role.Glow);
      return;
    case 'frog':
      for (let dx = 0; dx < hw - 1; dx++) m(dx, y, Role.Glow);
      m(hw - 1, y - 1, Role.Glow);
      return;
    case 'fox':
      for (let row = y - 1; row < bottom; row++)
        for (let dx = 1; dx < hw; dx++) if (dx > hw - 3 || row > y) m(dx, row, Role.Screen);
      m(0, y, Role.Glow);
      m(1, y + 1, Role.Glow);
      return;
  }
  m(0, y, Role.Screen);
  m(1, y, Role.Screen);
  m(0, y + 1, Role.Screen);
  m(1, y + 1, Role.Screen);
  m(2, y + 1, Role.Screen);
  if (y + 2 < bottom) {
    m(0, y + 2, Role.Screen);
    m(1, y + 2, Role.Screen);
  }
  c.paint(c.center, y, Role.Glow);
  c.paint(c.center, y + 1, Role.Glow);
  m(1, y + 2 < bottom ? y + 2 : y + 1, Role.Glow);
}

function extra(c: Canvas, t: AnimalTraits, top: number, hw: number, eyeRow: number): void {
  if (t.extra === 'bow') stamp(c, ['A.A', 'AAA', 'A.A'], c.center - hw - 1, top - 2);
  else if (t.extra === 'flower') stamp(c, ['.A.', 'ACA', '.A.'], c.center + hw - 1, top - 2);
  else if (t.extra === 'whiskers' && t.species !== 'frog') {
    c.mirror(hw + 1, eyeRow + 2, Role.Shade);
    c.mirror(hw + 1, eyeRow + 3, Role.Shade);
  }
}

/** Animals: cats, foxes, bears, bunnies, mice, dogs, pandas, owls, frogs and pigs. */
export const animal: Kind<AnimalTraits> = {
  name: 'Animal',
  traits,
  draw,
  palette: (t): Palette => COATS[t.coat] as Palette,
  shape: (t) => t.shape,
  describe: (t) => [t.species, t.eyes, t.marking, t.extra].filter((s) => s !== 'none').join(' · '),
};
