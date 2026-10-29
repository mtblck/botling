import type { Shape } from '../types.js';

/** Fraction of a triangle kept after shrinking it toward its centre, leaving a gap. */
const TRIANGLE_SCALE = 0.94;
/**
 * Solid cells overlap their neighbours by this much on each side, so
 * anti-aliasing doesn't leave hairline seams between them.
 */
const SOLID_BLEED = 0.01;
/** Half-diagonal of a diamond cell with a gap, so tips almost meet their neighbours'. */
const DIAMOND_RADIUS = 0.47;
/**
 * Half-diagonal of a solid diamond: a diamond this size has the same area as
 * the cell, so small robots keep their weight and the edges zigzag.
 */
const SOLID_DIAMOND_RADIUS = Math.SQRT1_2;

const fmt = (n: number): string => String(Math.round(n * 1000) / 1000);

/**
 * Draws one grid cell as an SVG element in grid units (one cell = 1 unit).
 *
 * Triangle cells alternate up and down like a chessboard and are twice as
 * wide as they are tall, so neighbours interlock into a triangular lattice.
 * Diamond cells are squares turned 45 degrees, centred on the cell.
 *
 * @param shape - Cell shape
 * @param x - Column
 * @param y - Row
 * @param isSolid - Fill the whole cell, with no gap to its neighbours
 * @returns An SVG element string with no fill, for the caller to group by colour
 */
export function cell(shape: Shape, x: number, y: number, isSolid = false): string {
  if (shape === 'circle') {
    return `<circle cx="${x + 0.5}" cy="${y + 0.5}" r="${isSolid ? 0.5 : 0.44}"/>`;
  }
  if (shape === 'diamond') {
    const r = isSolid ? SOLID_DIAMOND_RADIUS : DIAMOND_RADIUS;
    const cx = x + 0.5;
    const cy = y + 0.5;
    return `<polygon points="${fmt(cx)},${fmt(cy - r)} ${fmt(cx + r)},${fmt(cy)} ${fmt(cx)},${fmt(cy + r)} ${fmt(cx - r)},${fmt(cy)}"/>`;
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
    const k = isSolid ? 1 + 2 * SOLID_BLEED : TRIANGLE_SCALE;
    const shrunk = points.map(([px, py]) => `${fmt(cx + (px - cx) * k)},${fmt(my + (py - my) * k)}`);
    return `<polygon points="${shrunk.join(' ')}"/>`;
  }
  if (isSolid) {
    const side = 1 + 2 * SOLID_BLEED;
    return `<rect x="${fmt(x - SOLID_BLEED)}" y="${fmt(y - SOLID_BLEED)}" width="${side}" height="${side}"/>`;
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
