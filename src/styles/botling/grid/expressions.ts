import { type Canvas, CENTER, tagged } from '../../../core/canvas.js';
import { Role, type Traits } from '../types.js';
import type { Layout } from './layout.js';

/** Cell offsets from an eye's centre, as [columns outward, rows down]. */
type Cells = readonly (readonly [number, number])[];

const HAPPY: Cells = [
  [-1, 1],
  [0, 0],
  [1, 1],
];
const ANGRY_BROW: Cells = [
  [-1, 0],
  [0, -1],
  [1, -1],
];
const SURPRISED: Cells = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
];
/** A V on the triangle grid, where it lines up with the lattice. */
const CHEVRON: Cells = [
  [-1, 0],
  [0, 1],
  [1, 0],
];
/** Four dots round an empty centre; on circle cells a 2x2 block reads as a blob. */
const RING: Cells = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
];

/**
 * Draws the eyes that read as a mood, and the shape-specific eyes that stand
 * in for `cross` on triangle cells and `block` on circle cells.
 *
 * @param c - Canvas to draw on
 * @param t - The robot's traits
 * @param l - Shared layout
 * @returns Whether these eyes were drawn; false leaves them to the caller
 */
export function drawExpressionEyes(c: Canvas, t: Traits, l: Layout): boolean {
  const { eyeRow: y, eyeX: x } = l;
  const eyes = (cells: Cells, role: Role = Role.Glow): void => {
    for (const [dx, dy] of cells) c.mirror(x + dx, y + dy, role);
  };
  if (t.shape === 'triangle' && t.eyes === 'cross') eyes(CHEVRON);
  else if (t.shape === 'circle' && t.eyes === 'block') eyes(RING);
  else if (t.eyes === 'happy') eyes(HAPPY);
  else if (t.eyes === 'surprised') eyes(SURPRISED);
  else if (t.eyes === 'angry') {
    // The brow stays put when the eye under it blinks.
    tagged(c, null, () => eyes(ANGRY_BROW, Role.Accent));
    c.mirror(x, y + 1, Role.Glow);
  } else if (t.eyes === 'wink') {
    // Open on the left, shut on the right.
    c.paint(CENTER - x, y, Role.Glow);
    c.paint(CENTER - x, y + 1, Role.Glow);
    // Only the open eye blinks.
    tagged(c, null, () => {
      for (let dx = -1; dx <= 1; dx++) c.paint(CENTER + x + dx, y + 1, Role.Glow);
    });
  } else return false;
  return true;
}

/**
 * Draws the mouths that read as a mood.
 *
 * @param c - Canvas to draw on
 * @param t - The robot's traits
 * @param l - Shared layout
 * @param width - Mouth half-width, as the other mouths use it
 */
export function drawExpressionMouth(c: Canvas, t: Traits, l: Layout, width: number): void {
  const y = l.mouthRow;
  switch (t.mouth) {
    case 'frown':
      for (let dx = 0; dx < width; dx++) c.mirror(dx, y - 1, Role.Glow);
      c.mirror(width, y, Role.Glow);
      break;
    case 'grin':
      for (let dx = 0; dx <= width; dx++) c.mirror(dx, y - 1, Role.Glow);
      for (let dx = 0; dx < width; dx++) c.mirror(dx, y, Role.Glow);
      break;
    case 'zigzag':
      for (let dx = 0; dx <= width; dx++) c.mirror(dx, y - (dx % 2), Role.Glow);
      break;
  }
}
