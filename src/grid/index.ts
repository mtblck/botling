import type { RoleGrid, Traits } from '../types.js';
import { type Canvas, centreRows, createCanvas, tagged } from './canvas.js';
import { drawAccessory, drawChestLight, drawPattern, drawQuirk } from './details.js';
import { drawShoulders, drawSides, drawTop } from './extras.js';
import { drawEyes, drawMouth } from './face.js';
import { drawHead } from './head.js';
import { layout } from './layout.js';
import { slots } from './slots.js';

export { CENTER, GRID_SIZE, type Part, SMALL_GRID_SIZE } from './canvas.js';
export { drawSmallGrid, smallGrid } from './small/index.js';

/**
 * Draws the detailed robot for a set of traits. Later parts paint over
 * earlier ones, so the order below is part of the output contract. A robot
 * without shoulders is then centred top to bottom.
 *
 * @param t - The robot's traits
 * @returns The canvas, with each cell's role and the part that drew it
 */
export function drawGrid(t: Traits): Canvas {
  const c = createCanvas();
  const l = layout(t);
  const s = slots(t);
  drawHead(c, t, l);
  drawPattern(c, t, l);
  tagged(c, 'eyes', () => drawEyes(c, t, l));
  tagged(c, 'mouth', () => drawMouth(c, t, l));
  if (s.hasTop) tagged(c, 'top', () => drawTop(c, t, l));
  if (s.hasSides) tagged(c, 'sides', () => drawSides(c, t, l));
  drawShoulders(c, t);
  drawChestLight(c, t);
  // An off-side antenna moves like a top piece, a one-sided ear like the sides.
  tagged(c, t.quirk === 'antenna' ? 'top' : t.quirk === 'ear' ? 'sides' : null, () => drawQuirk(c, t, l));
  drawAccessory(c, t, l);
  if (!t.hasShoulders) centreRows(c, t.shape === 'triangle');
  return c;
}

/**
 * Builds the grid of cell roles for a set of traits.
 *
 * @param t - The robot's traits
 * @returns A {@link GRID_SIZE}-square grid of roles
 */
export function grid(t: Traits): RoleGrid {
  return drawGrid(t).cells;
}
