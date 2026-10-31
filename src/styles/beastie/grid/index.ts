import type { BeastieTraits, RoleGrid } from '../types.js';
import { drawGrid } from './full.js';
import { drawSmallGrid } from './small.js';

export { CENTER, GRID_SIZE, SMALL_GRID_SIZE } from '../../../core/canvas.js';
export { drawGrid, drawSmallGrid };

/**
 * Builds the detailed Beastie as a 15x15 grid of roles.
 *
 * @param t - The Beastie's traits
 * @returns A grid of roles, indexed `[row][column]`
 */
export function grid(t: BeastieTraits): RoleGrid {
  return drawGrid(t).cells;
}

/**
 * Builds the simpler 9x9 Beastie drawn below 40px.
 *
 * @param t - The Beastie's traits
 * @returns A grid of roles, indexed `[row][column]`
 */
export function smallGrid(t: BeastieTraits): RoleGrid {
  return drawSmallGrid(t).cells;
}
