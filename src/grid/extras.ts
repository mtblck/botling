import { Role, type Traits } from '../types.js';
import { type Canvas, GRID_SIZE } from './canvas.js';
import type { Layout } from './layout.js';

/**
 * Draws whatever sits on top of the head: antennas, horns, a fin and so on.
 *
 * @param c - Canvas to draw on
 * @param t - The robot's traits
 * @param l - Shared layout
 */
export function drawTop(c: Canvas, t: Traits, l: Layout): void {
  const y = l.top;
  const edge = t.halfWidth - 1;
  switch (t.top) {
    case 'antenna':
      c.mirror(0, y - 1, Role.Shade);
      c.mirror(0, y - 2, Role.Shade);
      c.mirror(0, y - 3, Role.Accent);
      break;
    case 'twin':
      c.mirror(edge, y - 1, Role.Shade);
      c.mirror(edge, y - 2, Role.Accent);
      break;
    case 'horns':
      c.mirror(edge, y - 1, Role.Body);
      c.mirror(edge + 1, y - 2, Role.Accent);
      break;
    case 'fin':
      c.mirror(0, y - 1, Role.Accent);
      c.mirror(0, y - 2, Role.Accent);
      c.mirror(1, y - 1, Role.Accent);
      break;
    case 'bolt':
      c.mirror(0, y - 1, Role.Accent);
      break;
    case 'dish':
      c.mirror(0, y - 1, Role.Shade);
      for (let dx = 0; dx <= 2; dx++) c.mirror(dx, y - 2, Role.Accent);
      break;
    case 'none':
      break;
  }
}

/**
 * Draws ears, bolts or handles beside the head.
 *
 * @param c - Canvas to draw on
 * @param t - The robot's traits
 * @param l - Shared layout
 */
export function drawSides(c: Canvas, t: Traits, l: Layout): void {
  const y = l.eyeRow;
  // A TV head is one cell wider in the middle, so its sides sit one further out.
  const out = t.halfWidth + (t.head === 'tv' ? 2 : 1);
  switch (t.sides) {
    case 'bolts':
      c.mirror(out, y + 1, Role.Accent);
      break;
    case 'ears':
      for (let dy = 0; dy <= 2; dy++) c.mirror(out, y + dy, Role.Shade);
      break;
    case 'handles':
      c.mirror(out, y, Role.Accent);
      c.mirror(out, y + 2, Role.Accent);
      for (let dy = 0; dy <= 2; dy++) c.mirror(out + 1, y + dy, Role.Accent);
      break;
    case 'none':
      break;
  }
}

/**
 * Draws a neck and shoulders across the bottom rows.
 *
 * @param c - Canvas to draw on
 * @param t - The robot's traits
 */
export function drawShoulders(c: Canvas, t: Traits): void {
  if (!t.hasShoulders) return;
  c.mirror(0, 12, Role.Shade);
  c.mirror(1, 12, Role.Shade);
  for (let y = 13; y < GRID_SIZE; y++) {
    for (let dx = 0; dx <= t.halfWidth + (y - 13); dx++) c.mirror(dx, y, dx === 0 ? Role.Accent : Role.Body);
  }
}
