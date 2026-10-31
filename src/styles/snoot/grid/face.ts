import type { Canvas } from '../../../core/canvas.js';
import { Role, type SnootTraits } from '../types.js';

/** Rows and columns of the detailed head that the markings share. */
export interface FaceLayout {
  top: number;
  eyeRow: number;
  /** Eye column, as cells left of centre. */
  eyeX: number;
  /** Head half-width. */
  hw: number;
}

/**
 * Paints the eyes, `x` cells either side of centre.
 *
 * @param c - Canvas to draw on
 * @param t - The Snoot's traits
 * @param y - Eye row
 * @param x - Eye column, as cells left of centre
 */
export function drawEyes(c: Canvas, t: SnootTraits, y: number, x: number): void {
  const g = (dx: number, row: number, role: Role = Role.Glow): void => c.mirror(dx, row, role);
  switch (t.eyes) {
    case 'dot':
      g(x, y);
      return;
    case 'tall':
      g(x, y);
      g(x, y + 1);
      return;
    case 'shine':
      g(x, y);
      g(x - 1, y);
      g(x, y + 1);
      g(x - 1, y + 1);
      g(x, y, Role.Screen);
      return;
    case 'sleepy':
      g(x, y + 1);
      g(x - 1, y + 1);
      return;
    case 'happy':
      g(x, y);
      g(x - 1, y + 1);
      g(x + 1, y + 1);
      return;
  }
}

/**
 * Paints the coat's markings; a panda always has its eye patches.
 *
 * @param c - Canvas to draw on
 * @param t - The Snoot's traits
 * @param l - Head rows and columns
 */
export function drawMarking(c: Canvas, t: SnootTraits, l: FaceLayout): void {
  const { top, eyeRow, eyeX, hw } = l;
  const isPanda = t.species === 'panda';
  if (isPanda || t.marking === 'mask') {
    for (let dx = eyeX - 1; dx <= eyeX + 1; dx++) for (const y of [eyeRow, eyeRow + 1]) c.mirror(dx, y, Role.Shade);
  }
  // A panda's patches leave room for its other markings; a mask doesn't.
  if (t.marking === 'mask') {
    for (let dx = 0; dx <= eyeX - 2; dx++) c.mirror(dx, eyeRow, Role.Shade);
  } else if (t.marking === 'stripes') {
    c.paint(c.center, top, Role.Shade);
    c.paint(c.center, top + 1, Role.Shade);
    c.mirror(2, top, Role.Shade);
    c.mirror(hw - 1, eyeRow + 1, Role.Shade);
    c.mirror(hw - 1, eyeRow + 3, Role.Shade);
  } else if (t.marking === 'patch' && !isPanda) {
    for (let dx = eyeX - 1; dx <= eyeX + 1; dx++)
      for (let y = eyeRow - 1; y <= eyeRow + 1; y++) c.paint(c.center - dx, y, Role.Shade);
  } else if (t.marking === 'spots') {
    c.paint(c.center + 1, top + 1, Role.Shade);
    c.paint(c.center - hw + 1, eyeRow + 2, Role.Shade);
    c.paint(c.center + 3, top, Role.Shade);
  }
}

/**
 * Paints the muzzle and nose, or the species' own: an owl's beak, a pig's
 * snout, a frog's grin, a fox's pale cheeks.
 *
 * @param c - Canvas to draw on
 * @param t - The Snoot's traits
 * @param y - Muzzle row
 * @param hw - Head half-width
 * @param bottom - Head's last row
 */
export function drawMuzzle(c: Canvas, t: SnootTraits, y: number, hw: number, bottom: number): void {
  const m = (dx: number, row: number, role: Role): void => c.mirror(dx, row, role);
  switch (t.species) {
    case 'owl':
      m(0, y - 1, Role.Accent);
      m(0, y, Role.Accent);
      return;
    case 'pig':
      for (const [dx, row] of [
        [0, y],
        [1, y],
        [0, y + 1],
        [1, y + 1],
      ] as const)
        m(dx, row, Role.Accent);
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
  for (const [dx, row] of [
    [0, y],
    [1, y],
    [0, y + 1],
    [1, y + 1],
    [2, y + 1],
  ] as const)
    m(dx, row, Role.Screen);
  if (y + 2 < bottom) {
    m(0, y + 2, Role.Screen);
    m(1, y + 2, Role.Screen);
  }
  c.paint(c.center, y, Role.Glow);
  c.paint(c.center, y + 1, Role.Glow);
  m(1, y + 2 < bottom ? y + 2 : y + 1, Role.Glow);
}
