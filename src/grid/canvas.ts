import { Role, type RoleGrid } from '../types.js';

/** Grid width and height. Odd, so there is a true centre column. */
export const GRID_SIZE = 15;
/** Index of the centre column. */
export const CENTER = (GRID_SIZE - 1) / 2;

/** A role grid plus the drawing helpers every part builder uses. */
export interface Canvas {
  cells: RoleGrid;
  /**
   * Paints a cell `dx` columns left of centre and its mirror on the right.
   * Cells outside the grid are ignored.
   */
  mirror: (dx: number, y: number, role: Role) => void;
  /** Paints one cell with no mirror. Cells outside the grid are ignored. */
  paint: (x: number, y: number, role: Role) => void;
}

/**
 * Creates an empty canvas.
 *
 * @returns A canvas whose cells are all {@link Role.Empty}
 */
export function createCanvas(): Canvas {
  const cells: RoleGrid = Array.from({ length: GRID_SIZE }, () => new Array<Role>(GRID_SIZE).fill(Role.Empty));
  const paint = (x: number, y: number, role: Role): void => {
    const row = cells[y];
    if (row && x >= 0 && x < GRID_SIZE) row[x] = role;
  };
  const mirror = (dx: number, y: number, role: Role): void => {
    paint(CENTER - dx, y, role);
    paint(CENTER + dx, y, role);
  };
  return { cells, mirror, paint };
}
