import { blob, stamp } from '../../../core/art.js';
import { type Canvas, createCanvas, SMALL_GRID_SIZE } from '../../../core/canvas.js';
import { Role, type SnootTraits } from '../types.js';

/** Ears on the 9x9 grid, as left-half art whose last row sits just above the head. Outer edge first. */
const EARS: Readonly<Partial<Record<string, { art: readonly string[]; ox: number }>>> = {
  cat: { art: ['S.', 'SA'], ox: 0 },
  fox: { art: ['S..', 'SA.'], ox: 0 },
  bear: { art: ['SS'], ox: 0 },
  panda: { art: ['SS'], ox: 0 },
  mouse: { art: ['SSS', 'SAS'], ox: -1 },
  bunny: { art: ['S', 'A'], ox: 1 },
  owl: { art: ['S'], ox: 0 },
  pig: { art: ['SS'], ox: 0 },
};

const TOP = 2;
const EYE_ROW = 4;
const EYE_X = 2;

/**
 * Draws the simpler 9x9 Snoot for small sizes, from the same traits as the
 * detailed one: the species' ears, the eyes and muzzle, and the markings,
 * cheeks and bows that still fit. Matt picked this over a face-only version.
 *
 * @param t - The Snoot's traits
 * @returns The canvas
 */
export function drawSmallGrid(t: SnootTraits): Canvas {
  const c = createCanvas(SMALL_GRID_SIZE);
  const isFrog = t.species === 'frog';
  const hw = 3;
  const rows = isFrog ? [3, 4, 4, 4, 3] : [2, 3, 3, 3, 3, 2];
  blob(c, TOP, rows, Role.Body, Role.Shade);
  const ear = EARS[t.species];
  if (ear) {
    const top = TOP - ear.art.length;
    stamp(c, ear.art, c.center - hw + ear.ox, top);
    stamp(c, ear.art, c.center - hw + ear.ox, top, true);
  }
  if (t.species === 'dog') {
    for (const y of [TOP, TOP + 1, TOP + 2]) c.mirror(hw, y, Role.Shade);
    c.mirror(hw + 1, TOP + 1, Role.Shade);
    c.mirror(hw + 1, TOP + 2, Role.Shade);
  }
  marking(c, t);
  if (isFrog) {
    // Eyes sit on bumps above the head.
    stamp(c, ['BGB'], c.center - 3, TOP - 1);
    stamp(c, ['BGB'], c.center - 3, TOP - 1, true);
    for (let dx = 0; dx <= 2; dx++) c.mirror(dx, TOP + 3, Role.Glow);
    return c;
  }
  if (t.species === 'owl') for (const dx of [1, 2, 3]) c.mirror(dx, EYE_ROW, Role.Screen);
  eyes(c, t);
  muzzle(c, t);
  if (t.hasCheeks && t.species !== 'owl') c.mirror(EYE_X + 1, EYE_ROW + 1, Role.Accent);
  if (t.extra === 'bow') stamp(c, ['A.A', '.A.'], c.center - hw - 1, TOP - 2);
  else if (t.extra === 'flower') stamp(c, ['.A.', 'ACA'], c.center + hw - 1, TOP - 2);
  return c;
}

function patches(c: Canvas): void {
  for (const dx of [EYE_X - 1, EYE_X, EYE_X + 1]) c.mirror(dx, EYE_ROW, Role.Shade);
  c.mirror(EYE_X, EYE_ROW + 1, Role.Shade);
}

function marking(c: Canvas, t: SnootTraits): void {
  if (t.species === 'panda' || t.marking === 'mask') patches(c);
  if (t.marking === 'mask') return;
  if (t.marking === 'stripes') {
    c.paint(c.center, TOP, Role.Shade);
    c.mirror(3, EYE_ROW + 1, Role.Shade);
  } else if (t.marking === 'patch') {
    for (const dx of [EYE_X - 1, EYE_X, EYE_X + 1]) c.paint(c.center - dx, EYE_ROW, Role.Shade);
    c.paint(c.center - EYE_X, EYE_ROW - 1, Role.Shade);
  } else if (t.marking === 'spots') {
    c.paint(c.center + 1, TOP + 1, Role.Shade);
    c.paint(c.center - 2, TOP + 4, Role.Shade);
  }
}

function eyes(c: Canvas, t: SnootTraits): void {
  if (t.eyes === 'tall') {
    c.mirror(EYE_X, EYE_ROW - 1, Role.Glow);
    c.mirror(EYE_X, EYE_ROW, Role.Glow);
  } else if (t.eyes === 'sleepy') {
    c.mirror(EYE_X, EYE_ROW, Role.Glow);
    c.mirror(EYE_X + 1, EYE_ROW, Role.Glow);
  } else c.mirror(EYE_X, EYE_ROW, Role.Glow);
}

function muzzle(c: Canvas, t: SnootTraits): void {
  const y = EYE_ROW + 1;
  if (t.species === 'owl') {
    c.paint(c.center, y, Role.Accent);
    return;
  }
  if (t.species === 'pig') {
    c.mirror(0, y, Role.Accent);
    c.mirror(1, y, Role.Accent);
    c.paint(c.center, y, Role.Glow);
    return;
  }
  if (t.species === 'fox') {
    for (const dx of [1, 2]) c.mirror(dx, y + 1, Role.Screen);
    c.mirror(0, y + 1, Role.Screen);
  }
  c.mirror(1, y, Role.Screen);
  c.mirror(1, y + 1, Role.Screen);
  c.paint(c.center, y, Role.Glow);
  c.paint(c.center, y + 1, Role.Screen);
}
