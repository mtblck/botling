import type { Shape } from '../types.js';

/** Fraction of a triangle kept after shrinking it toward its centre, leaving a gap. */
const TRIANGLE_SCALE = 0.94;

const fmt = (n: number): string => String(Math.round(n * 1000) / 1000);

/**
 * Draws one grid cell as an SVG element in grid units (one cell = 1 unit).
 *
 * Triangle cells alternate up and down like a chessboard and are twice as
 * wide as they are tall, so neighbours interlock into a triangular lattice.
 *
 * @param shape - Cell shape
 * @param x - Column
 * @param y - Row
 * @returns An SVG element string with no fill, for the caller to group by colour
 */
export function cell(shape: Shape, x: number, y: number): string {
  if (shape === 'circle') {
    return `<circle cx="${x + 0.5}" cy="${y + 0.5}" r="0.44"/>`;
  }
  if (shape === 'triangle') {
    const isUp = (x + y) % 2 === 0;
    const cx = x + 0.5;
    const points: [number, number][] = isUp
      ? [
          [cx, y],
          [cx + 1, y + 1],
          [cx - 1, y + 1],
        ]
      : [
          [cx - 1, y],
          [cx + 1, y],
          [cx, y + 1],
        ];
    const my = y + (isUp ? 2 / 3 : 1 / 3);
    const shrunk = points.map(
      ([px, py]) => `${fmt(cx + (px - cx) * TRIANGLE_SCALE)},${fmt(my + (py - my) * TRIANGLE_SCALE)}`,
    );
    return `<polygon points="${shrunk.join(' ')}"/>`;
  }
  return `<rect x="${fmt(x + 0.06)}" y="${fmt(y + 0.06)}" width="0.88" height="0.88" rx="0.12"/>`;
}

/**
 * Padding around the grid, in cells. Triangles overhang their column by half
 * a cell on each side, so they need more room.
 *
 * @param shape - Cell shape
 * @returns Padding in grid units
 */
export function padding(shape: Shape): number {
  return shape === 'triangle' ? 0.8 : 0.5;
}
