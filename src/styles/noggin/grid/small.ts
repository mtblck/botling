import { blob } from '../../../core/art.js';
import { type Canvas, createCanvas, SMALL_GRID_SIZE } from '../../../core/canvas.js';
import { type NogginTraits, Role } from '../types.js';

/** The 9x9 head: its top row, rows of half-widths, eye row and eye column. */
const TOP = 2;
const HEAD = [2, 3, 3, 3, 2];
const EYE_ROW = 4;
const EYE_X = 1;

/** Hairstyles on the 9x9 grid, as rows of [y, from dx, to dx] painted in shade on both sides. */
const HAIR: Readonly<Record<string, readonly (readonly [number, number, number])[]>> = {
  bald: [],
  buzz: [[2, 0, 2]],
  short: [
    [1, 0, 2],
    [2, 0, 3],
  ],
  spiky: [
    [0, 0, 0],
    [0, 2, 2],
    [1, 0, 2],
    [2, 0, 3],
  ],
  bob: [
    [1, 0, 2],
    [2, 0, 4],
    [3, 4, 4],
    [4, 4, 4],
  ],
  long: [
    [1, 0, 2],
    [2, 0, 4],
    [3, 4, 4],
    [4, 4, 4],
    [5, 4, 4],
    [6, 4, 4],
  ],
  bun: [
    [0, 0, 0],
    [1, 0, 2],
    [2, 0, 3],
  ],
  mohawk: [
    [0, 0, 0],
    [1, 0, 0],
    [2, 0, 0],
  ],
  curly: [
    [1, 0, 3],
    [2, 0, 4],
    [3, 4, 4],
  ],
  sidepart: [
    [1, 0, 2],
    [2, 0, 3],
  ],
  afro: [
    [0, 0, 2],
    [1, 0, 4],
    [2, 0, 4],
    [3, 4, 4],
    [4, 4, 4],
  ],
  locs: [
    [1, 0, 2],
    [2, 0, 3],
    [3, 4, 4],
    [5, 4, 4],
    [7, 4, 4],
  ],
};

/**
 * Draws the simpler 9x9 Noggin for small sizes, from the same traits as the
 * detailed one.
 *
 * @param t - The Noggin's traits
 * @returns A 9x9 canvas
 */
export function drawSmallGrid(t: NogginTraits): Canvas {
  const c = createCanvas(SMALL_GRID_SIZE);
  blob(c, 7, [3, 4], Role.Screen);
  c.paint(c.center, 7, Role.Body);
  blob(c, TOP, HEAD, Role.Body);
  if (t.headwear !== 'headscarf') {
    for (const [y, from, to] of HAIR[t.hair] ?? []) for (let dx = from; dx <= to; dx++) c.mirror(dx, y, Role.Shade);
    if (t.hair === 'sidepart') c.paint(c.center - 3, 3, Role.Shade);
  }
  if (t.facial === 'beard') {
    blob(c, 5, [3, 2], Role.Shade);
    c.paint(c.center, 5, Role.Body);
  } else if (t.facial === 'mustache') c.mirror(0, 5, Role.Shade);
  eyes(c, t);
  const mouthRow = t.facial === 'mustache' ? 6 : 5;
  if (t.facial !== 'beard') {
    c.paint(c.center, mouthRow, t.mouth === 'open' ? Role.Accent : Role.Glow);
    if (t.mouth === 'smile') c.mirror(1, mouthRow, Role.Glow);
    if (t.mouth === 'smirk') c.paint(c.center + 1, mouthRow, Role.Glow);
  }
  if (t.hasCheeks && t.facial !== 'beard' && t.eyewear === 'none') c.mirror(2, 5, Role.Accent);
  if (t.eyewear === 'shades') for (const dx of [0, 1, 2]) c.mirror(dx, EYE_ROW, Role.Glow);
  else if (t.eyewear === 'glasses') {
    c.mirror(2, EYE_ROW, Role.Accent);
    c.paint(c.center, EYE_ROW, Role.Accent);
  }
  headwear(c, t);
  return c;
}

function eyes(c: Canvas, t: NogginTraits): void {
  if (t.eyes === 'wink') {
    c.paint(c.center - EYE_X, EYE_ROW, Role.Glow);
    c.paint(c.center + EYE_X, EYE_ROW, Role.Shade);
  } else c.mirror(EYE_X, EYE_ROW, t.eyes === 'closed' ? Role.Shade : Role.Glow);
  if (t.hasBrows && t.eyewear !== 'shades') c.mirror(EYE_X, EYE_ROW - 1, Role.Shade);
}

function headwear(c: Canvas, t: NogginTraits): void {
  switch (t.headwear) {
    case 'beanie':
      blob(c, 0, [2, 3], Role.Accent);
      return;
    case 'headband':
      for (let dx = 0; dx <= 3; dx++) c.mirror(dx, 2, Role.Accent);
      return;
    case 'earring':
      c.paint(c.center + 4, 5, Role.Accent);
      return;
    case 'headscarf':
      blob(c, 1, [2, 4, 4], Role.Accent);
      for (let y = 4; y <= 6; y++) c.mirror(4, y, Role.Accent);
      c.mirror(3, 6, Role.Accent);
      return;
  }
}
