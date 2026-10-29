import type { RoleGrid, Traits } from '../../types.js';
import { type Canvas, createCanvas, SMALL_GRID_SIZE, tagged } from '../canvas.js';
import { drawSmallDetails } from './details.js';
import { drawSmallExtras } from './extras.js';
import { drawSmallEyes, drawSmallMouth } from './face.js';
import { drawSmallHead } from './head.js';
import { smallLayout } from './layout.js';

/**
 * Draws the simpler 9x9 robot used at small sizes. It comes from the same
 * traits as the detailed one, so a robot keeps its palette, head, eyes,
 * mouth and top piece at every size and only loses detail. Only the eyes
 * are tagged: at 24px anything busier than a blink reads as flicker, so the
 * small robot only blinks and hovers.
 *
 * @param t - The robot's traits
 * @returns The canvas, with each cell's role and the part that drew it
 */
export function drawSmallGrid(t: Traits): Canvas {
  const c = createCanvas(SMALL_GRID_SIZE);
  const l = smallLayout(t);
  drawSmallHead(c, t, l);
  tagged(c, 'eyes', () => drawSmallEyes(c, t, l));
  drawSmallMouth(c, t, l);
  drawSmallExtras(c, t, l);
  drawSmallDetails(c, t, l);
  return c;
}

/**
 * Builds the simpler 9x9 grid drawn at small sizes. See {@link drawSmallGrid}.
 *
 * @param t - The robot's traits
 * @returns A {@link SMALL_GRID_SIZE}-square grid of roles
 */
export function smallGrid(t: Traits): RoleGrid {
  return drawSmallGrid(t).cells;
}
