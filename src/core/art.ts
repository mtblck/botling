import type { Canvas } from './canvas.js';
import { Role } from './types.js';

/** Characters used in art strings, and the role each paints. A `.` paints nothing. */
const ROLES: Readonly<Record<string, Role>> = {
  B: Role.Body,
  S: Role.Shade,
  C: Role.Screen,
  G: Role.Glow,
  A: Role.Accent,
  x: Role.Empty,
};

/**
 * Paints art rows onto a canvas, top-left at `x0`, `y0`.
 *
 * @param c - Canvas to draw on
 * @param rows - One string per row; `B`, `S`, `C`, `G` and `A` paint a role, `x` clears a cell
 * @param x0 - Column of the first character
 * @param y0 - Row of the first string
 * @param flip - Mirror the art left to right about the canvas centre
 */
export function stamp(c: Canvas, rows: readonly string[], x0: number, y0: number, flip = false): void {
  rows.forEach((row, dy) => {
    [...row].forEach((ch, dx) => {
      const role = ROLES[ch];
      if (role === undefined) return;
      const x = x0 + dx;
      c.paint(flip ? 2 * c.center - x : x, y0 + dy, role);
    });
  });
}

/**
 * Fills a mirrored blob row by row, with its outermost cell on each row in `edge`.
 *
 * @param c - Canvas to draw on
 * @param top - First row
 * @param widths - Half-width of each row, not counting the centre column
 * @param fill - Role inside
 * @param edge - Role of each row's outermost cells
 */
export function blob(c: Canvas, top: number, widths: readonly number[], fill: Role, edge: Role = fill): void {
  widths.forEach((w, i) => {
    for (let dx = 0; dx <= w; dx++) c.mirror(dx, top + i, dx === w ? edge : fill);
  });
}
