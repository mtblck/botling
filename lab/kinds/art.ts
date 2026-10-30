import { type Canvas, createCanvas } from '../../src/core/canvas.js';
import type { Palette, Shape } from '../../src/styles/botling/types.js';
import { Role } from '../../src/styles/botling/types.js';

/** One avatar family: how a seed becomes traits, a picture and colours. */
export interface Kind<T> {
  name: string;
  /** Picks every trait for a seed. */
  traits: (seed: string) => T;
  /** Draws the 15x15 picture for a set of traits. */
  draw: (t: T) => Canvas;
  /** The colours the traits name. */
  palette: (t: T) => Palette;
  /** The cell shape the traits name. */
  shape: (t: T) => Shape;
  /** A short description of the traits, for the comparison page. */
  describe: (t: T) => string;
}

/** Characters used in art strings, and the role each paints. A space or `.` paints nothing. */
const ROLES: Record<string, Role> = {
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
 * @param rows - One string per row; see {@link ROLES}
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
 * Paints left-half art and its mirror. Each row's last character sits on
 * the centre column; earlier characters go left of it.
 *
 * @param c - Canvas to draw on
 * @param rows - Left halves, centre column last
 * @param y0 - Row of the first string
 */
export function stampMirror(c: Canvas, rows: readonly string[], y0: number): void {
  rows.forEach((row, dy) => {
    const chars = [...row];
    chars.forEach((ch, i) => {
      const role = ROLES[ch];
      if (role !== undefined) c.mirror(chars.length - 1 - i, y0 + dy, role);
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

export type { Canvas };
export { createCanvas, Role };
