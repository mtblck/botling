import { Role, type RoleGrid } from './types.js';

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
  /** What each cell showed before the first part painted it: what a blink or talk uncovers. */
  under: RoleGrid;
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
  const under: RoleGrid = Array.from({ length: size }, () => new Array<Role>(size).fill(Role.Empty));
  const c: Canvas = {
    cells,
    parts,
    under,
    part: null,
    center,
    paint: (x, y, role) => {
      const row = cells[y];
      const tags = parts[y];
      if (!row || !tags || x < 0 || x >= size) return;
      // Only the first moving part records what it covers; a later one covers a moving part.
      const below = under[y];
      if (below && c.part !== null && tags[x] === null) below[x] = row[x] ?? Role.Empty;
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

/**
 * Runs a drawing step but keeps a part's tag on the cells it already had, so
 * a part drawn over another (a mouth corner on an eye) can't take a piece of
 * it: those cells keep moving with the part they started in. The picture is
 * unchanged.
 *
 * @param c - Canvas to draw on
 * @param keep - The part whose cells keep their tag
 * @param draw - The drawing step
 */
export function keepTags(c: Canvas, keep: Part, draw: () => void): void {
  const kept = c.parts.map((row) => row.map((part) => part === keep));
  draw();
  for (const [y, row] of kept.entries()) {
    const tags = c.parts[y];
    for (const [x, was] of row.entries()) if (was && tags) tags[x] = keep;
  }
}

/**
 * Moves cells of one part that touch another part's cells of the same role,
 * directly or through each other, into that other part, so a glyph drawn by
 * two parts (a grin that runs into an eye) moves as one. The picture is
 * unchanged.
 *
 * @param c - The drawn canvas
 * @param from - The part that gives up the touching cells
 * @param to - The part they join
 */
export function joinTouching(c: Canvas, from: Part, to: Part): void {
  const queue: [number, number][] = [];
  c.parts.forEach((row, y) => {
    row.forEach((part, x) => {
      if (part === to) queue.push([x, y]);
    });
  });
  for (let next = queue.shift(); next; next = queue.shift()) {
    const [x, y] = next;
    const role = c.cells[y]?.[x];
    for (const [nx, ny] of [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ] as const) {
      const tags = c.parts[ny];
      if (tags?.[nx] !== from || c.cells[ny]?.[nx] !== role) continue;
      tags[nx] = to;
      queue.push([nx, ny]);
    }
  }
}

/**
 * Moves everything drawn up or down by whole rows so it sits in the middle
 * of the canvas, for a robot with no shoulders anchoring it to the bottom.
 * Triangle cells flip with every row, so they only move by even rows.
 *
 * @param c - Canvas to centre
 * @param evenOnly - Move by an even number of rows only
 */
export function centreRows(c: Canvas, evenOnly: boolean): void {
  const used = c.cells.flatMap((row, y) => (row.some((r) => r !== Role.Empty) ? [y] : []));
  const first = used[0];
  const last = used[used.length - 1];
  if (first === undefined || last === undefined) return;
  let shift = Math.trunc((c.cells.length - 1 - last - first) / 2);
  if (evenOnly) shift -= shift % 2;
  if (shift === 0) return;
  const move = <T>(rows: T[][], blank: T): T[][] =>
    rows.map((_, y) => rows[y - shift]?.slice() ?? new Array<T>(rows.length).fill(blank));
  const cells = move(c.cells, Role.Empty as Role);
  const parts = move(c.parts, null as Part);
  const under = move(c.under, Role.Empty as Role);
  c.cells.splice(0, c.cells.length, ...cells);
  c.parts.splice(0, c.parts.length, ...parts);
  c.under.splice(0, c.under.length, ...under);
}
