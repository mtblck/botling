import type { RoleGrid, Traits } from '../types.js';
import { createCanvas } from './canvas.js';
import { drawShoulders, drawSides, drawTop } from './extras.js';
import { drawEyes, drawMouth } from './face.js';
import { drawHead } from './head.js';
import { layout } from './layout.js';

export { CENTER, GRID_SIZE } from './canvas.js';

/**
 * Builds the grid of cell roles for a set of traits. Later parts paint over
 * earlier ones, so the order below is part of the output contract.
 *
 * @param t - The robot's traits
 * @returns A {@link GRID_SIZE}-square grid of roles
 */
export function grid(t: Traits): RoleGrid {
  const c = createCanvas();
  const l = layout(t);
  drawHead(c, t, l);
  drawEyes(c, t, l);
  drawMouth(c, t, l);
  drawTop(c, t, l);
  drawSides(c, t, l);
  drawShoulders(c, t);
  return c.cells;
}
