import type { NogginTraits, RoleGrid } from '../types.js';
import { drawGrid } from './full.js';
import { drawSmallGrid } from './small.js';

export { CENTER, GRID_SIZE, SMALL_GRID_SIZE } from '../../../core/canvas.js';
export { drawGrid, drawSmallGrid };

/**
 * Builds the detailed Noggin as a 15x15 grid of roles.
 *
 * @param t - The Noggin's traits
 * @returns A grid of roles, indexed `[row][column]`
 */
export function grid(t: NogginTraits): RoleGrid {
  return drawGrid(t).cells;
}

/**
 * Builds the simpler 9x9 Noggin drawn below 40px.
 *
 * @param t - The Noggin's traits
 * @returns A grid of roles, indexed `[row][column]`
 */
export function smallGrid(t: NogginTraits): RoleGrid {
  return drawSmallGrid(t).cells;
}
