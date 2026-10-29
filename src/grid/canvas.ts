import { Role, type RoleGrid } from '../types.js';

/** Detailed grid width and height. Odd, so there is a true centre column. */
export const GRID_SIZE = 15;
/** Width and height of the simpler grid used at small sizes. */
export const SMALL_GRID_SIZE = 9;
/** Index of the detailed grid's centre column. */
export const CENTER = (GRID_SIZE - 1) / 2;

/** A role grid plus the drawing helpers every part builder uses. */
export interface Canvas {
  cells: RoleGrid;
  /** Index of the centre column. */
  center: number;
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
 * @param size - Width and height in cells; odd
 * @returns A canvas whose cells are all {@link Role.Empty}
 */
export function createCanvas(size: number = GRID_SIZE): Canvas {
  const center = (size - 1) / 2;
  const cells: RoleGrid = Array.from({ length: size }, () => new Array<Role>(size).fill(Role.Empty));
  const paint = (x: number, y: number, role: Role): void => {
    const row = cells[y];
    if (row && x >= 0 && x < size) row[x] = role;
  };
  const mirror = (dx: number, y: number, role: Role): void => {
    paint(center - dx, y, role);
    paint(center + dx, y, role);
  };
  return { cells, center, mirror, paint };
}
