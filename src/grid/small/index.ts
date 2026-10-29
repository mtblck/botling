import type { RoleGrid, Traits } from '../../types.js';
import { createCanvas, SMALL_GRID_SIZE } from '../canvas.js';
import { drawSmallDetails } from './details.js';
import { drawSmallExtras } from './extras.js';
import { drawSmallEyes, drawSmallMouth } from './face.js';
import { drawSmallHead } from './head.js';
import { smallLayout } from './layout.js';

/**
 * Builds the simpler 9x9 grid drawn at small sizes. It comes from the same
 * traits as {@link grid}, so a robot keeps its palette, head, eyes, mouth and
 * top piece at every size and only loses detail.
 *
 * @param t - The robot's traits
 * @returns A {@link SMALL_GRID_SIZE}-square grid of roles
 */
export function smallGrid(t: Traits): RoleGrid {
  const c = createCanvas(SMALL_GRID_SIZE);
  const l = smallLayout(t);
  drawSmallHead(c, t, l);
  drawSmallEyes(c, t, l);
  drawSmallMouth(c, t, l);
  drawSmallExtras(c, t, l);
  drawSmallDetails(c, t, l);
  return c.cells;
}
