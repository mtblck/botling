import type { Shape } from '../types.js';
import { num } from './path.js';

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
/** Inset of a gapped square cell, and the radius of its rounded corners. */
const SQUARE_INSET = 0.06;
const SQUARE_RADIUS = 0.12;
const CIRCLE_RADIUS = 0.44;

/** A point in thousandths of a grid unit, so path data can be built from exact integers. */
export type Point = readonly [number, number];
/** One cell: the corners of a polygon, or a single point for a round dot. */
export type Outline = readonly Point[];

/**
 * How a shape's cells are painted. `fill` fills the polygons; `stroke` draws
 * each single point as a round dot; `both` fills and strokes with round
 * joins, which grows a square into a rounded one with fewer bytes than arcs.
 */
export interface CellStyle {
  paint: 'fill' | 'stroke' | 'both';
  /** Attributes shared by every colour, for one wrapping `<g>`; empty when there are none. */
  attrs: string;
}

const milli = (n: number): number => Math.round(n * 1000);
const pt = (x: number, y: number): Point => [milli(x), milli(y)];

/**
 * How cells of a shape are painted.
 *
 * @param shape - Cell shape
 * @param isSolid - Cells fill the whole grid square, with no gap to their neighbours
 * @returns Paint mode and shared attributes
 */
export function cellStyle(shape: Shape, isSolid: boolean): CellStyle {
  if (shape === 'circle') {
    const width = isSolid ? 1 : 2 * CIRCLE_RADIUS;
    return { paint: 'stroke', attrs: `fill="none" stroke-width="${num(milli(width))}" stroke-linecap="round"` };
  }
  if (shape === 'square' && !isSolid) {
    return { paint: 'both', attrs: `stroke-width="${num(milli(2 * SQUARE_RADIUS))}" stroke-linejoin="round"` };
  }
  return { paint: 'fill', attrs: '' };
}

/**
 * The outline of one grid cell, in grid units (one cell = 1 unit) scaled to
 * thousandths and paired with {@link cellStyle} for how to paint it.
 *
 * Triangle cells alternate up and down like a chessboard and are twice as
 * wide as they are tall, so neighbours interlock into a triangular lattice.
 * Diamond cells are squares turned 45 degrees, centred on the cell. A gapped
 * square is the inner square that a round-joined stroke grows to 0.88 cells
 * with 0.12 corners; a circle is its centre, drawn as a round-capped dot.
 *
 * @param shape - Cell shape
 * @param x - Column
 * @param y - Row
 * @param isSolid - Fill the whole cell, with no gap to its neighbours
 * @returns The cell's points, clockwise
 */
export function outline(shape: Shape, x: number, y: number, isSolid = false): Outline {
  const cx = x + 0.5;
  const cy = y + 0.5;
  if (shape === 'circle') return [pt(cx, cy)];
  if (shape === 'diamond') {
    const r = isSolid ? SOLID_DIAMOND_RADIUS : DIAMOND_RADIUS;
    return [pt(cx, cy - r), pt(cx + r, cy), pt(cx, cy + r), pt(cx - r, cy)];
  }
  if (shape === 'triangle') {
    const isUp = (x + y) % 2 === 0;
    const corners: Point[] = isUp
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
    return corners.map(([px, py]) => pt(cx + (px - cx) * k, my + (py - my) * k));
  }
  const a = isSolid ? -SOLID_BLEED : SQUARE_INSET + SQUARE_RADIUS;
  const b = isSolid ? 1 + SOLID_BLEED : 1 - SQUARE_INSET - SQUARE_RADIUS;
  return [pt(x + a, y + a), pt(x + b, y + a), pt(x + b, y + b), pt(x + a, y + b)];
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

/**
 * Points on the edge of a gapped cell as drawn, in thousandths: enough to
 * tell whether the whole cell fits inside a convex frame. Round dots and the
 * rounded corners of squares are tested at their compass and diagonal points.
 *
 * @param shape - Cell shape
 * @param x - Column
 * @param y - Row
 * @returns Points on the cell's drawn edge
 */
export function edge(shape: Shape, x: number, y: number): Outline {
  if (shape === 'triangle' || shape === 'diamond') return outline(shape, x, y);
  // A circle is a dot of CIRCLE_RADIUS; a square is a box inset by SQUARE_INSET with SQUARE_RADIUS corners.
  const r = shape === 'circle' ? CIRCLE_RADIUS : SQUARE_RADIUS;
  const half = shape === 'circle' ? 0 : 0.5 - SQUARE_INSET - SQUARE_RADIUS;
  const d = r * Math.SQRT1_2;
  const out: Point[] = [];
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      const cx = x + 0.5 + sx * half;
      const cy = y + 0.5 + sy * half;
      out.push(pt(cx + sx * r, cy), pt(cx, cy + sy * r), pt(cx + sx * d, cy + sy * d));
    }
  }
  return out;
}
