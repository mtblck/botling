import { type Canvas, createCanvas } from '../../src/core/canvas.js';
import { Role } from '../../src/core/types.js';

/** Fills cells `xl`..`xr` on row `y`, with the two end cells in `edge`. */
export function span(
  c: Canvas,
  y: number,
  xl: number,
  xr: number,
  fill: Role = Role.Body,
  edge: Role = Role.Shade,
): void {
  for (let x = xl; x <= xr; x++) c.paint(x, y, x === xl || x === xr ? edge : fill);
}

/**
 * Fills a blob row by row from half-widths about the centre, each row
 * nudged sideways by `shift(i)` columns: how a flame's tip sways.
 */
export function rows(
  c: Canvas,
  top: number,
  widths: readonly number[],
  shift: (i: number) => number = () => 0,
  fill: Role = Role.Body,
  edge: Role = Role.Shade,
): void {
  widths.forEach((w, i) => {
    const m = c.center + shift(i);
    span(c, top + i, m - w, m + w, fill, edge);
  });
}

/** Paints a list of `[x, y]` cells in one role. */
export function dots(c: Canvas, cells: readonly (readonly [number, number])[], role: Role): void {
  for (const [x, y] of cells) c.paint(x, y, role);
}

/** Paints a pair of eyes `dx` either side of centre, `h` cells tall. */
export function eyes(c: Canvas, dx: number, y: number, h = 1): void {
  for (let i = 0; i < h; i++) c.mirror(dx, y + i, Role.Glow);
}

export type { Canvas };
export { createCanvas, Role };
