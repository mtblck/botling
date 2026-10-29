import { Role, type RoleGrid } from '../types.js';

/** Detailed grid width and height. Odd, so there is a true centre column. */
export const GRID_SIZE = 15;
/** Width and height of the simpler grid used at small sizes. */
export const SMALL_GRID_SIZE = 9;
/** Index of the detailed grid's centre column. */
export const CENTER = (GRID_SIZE - 1) / 2;

/**
 * The parts an animated robot moves: the eyes, the mouth, the top piece and
 * the side pieces. Every other cell is untagged.
 */
export type Part = 'eyes' | 'mouth' | 'top' | 'sides' | null;

/** A role grid plus the drawing helpers every part builder uses. */
export interface Canvas {
  cells: RoleGrid;
  /** Which part last painted each cell, indexed like `cells`. */
  parts: Part[][];
  /** The part that painting tags cells with; builders set it around the parts that move. */
  part: Part;
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
  const parts: Part[][] = Array.from({ length: size }, () => new Array<Part>(size).fill(null));
  const c: Canvas = {
    cells,
    parts,
    part: null,
    center,
    paint: (x, y, role) => {
      const row = cells[y];
      const tags = parts[y];
      if (!row || !tags || x < 0 || x >= size) return;
      row[x] = role;
      tags[x] = c.part;
    },
    mirror: (dx, y, role) => {
      c.paint(center - dx, y, role);
      c.paint(center + dx, y, role);
    },
  };
  return c;
}

/**
 * Tags the cells a drawing step paints with a part, so the renderer can
 * animate them.
 *
 * @param c - Canvas to draw on
 * @param part - Tag for the cells painted
 * @param draw - The drawing step
 */
export function tagged(c: Canvas, part: Part, draw: () => void): void {
  const before = c.part;
  c.part = part;
  draw();
  c.part = before;
}
