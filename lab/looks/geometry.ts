import { Role, type RoleGrid } from '../../src/core/types.js';

/** A colour per cell, or null where the cell is empty. */
export type ColourGrid = (string | null)[][];

/**
 * Colours each cell by its role.
 *
 * @param cells - Role grid
 * @param colours - Colour per role
 * @returns The colour grid
 */
export function colourGrid(cells: RoleGrid, colours: Record<number, string>): ColourGrid {
  return cells.map((row) => row.map((r) => (r === Role.Empty ? null : (colours[r] ?? null))));
}

const f = (n: number): string => String(Math.round(n * 1000) / 1000);
const at = (g: ColourGrid, x: number, y: number): string | null => g[y]?.[x] ?? null;
const CORNERS = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
] as const;

/**
 * A square cell with some corners rounded, as path data.
 *
 * @param x - Column
 * @param y - Row
 * @param r - Radius of each corner, clockwise from top left
 * @returns Path data
 */
function roundedCell(x: number, y: number, r: readonly number[]): string {
  const [tl = 0, tr = 0, br = 0, bl = 0] = r;
  const arc = (rad: number, dx: number, dy: number): string =>
    rad ? `a${f(rad)} ${f(rad)} 0 0 1 ${f(dx)} ${f(dy)}` : '';
  return (
    `M${f(x + tl)} ${f(y)}H${f(x + 1 - tr)}${arc(tr, tr, tr)}V${f(y + 1 - br)}${arc(br, -br, br)}` +
    `H${f(x + bl)}${arc(bl, -bl, -bl)}V${f(y + tl)}${arc(tl, tl, -tl)}Z`
  );
}

/** The corner square of one cell, `r` on a side, toward (sx, sy). */
function cornerBox(x: number, y: number, sx: number, sy: number, r: number): string {
  const x0 = sx < 0 ? x : x + 1 - r;
  const y0 = sy < 0 ? y : y + 1 - r;
  return `M${f(x0)} ${f(y0)}h${f(r)}v${f(r)}h${f(-r)}Z`;
}

/** A fillet: the corner square of a cell minus a quarter circle centred away from the corner. */
function fillet(x: number, y: number, sx: number, sy: number, r: number): string {
  const cx = sx < 0 ? x : x + 1;
  const cy = sy < 0 ? y : y + 1;
  // From the corner, along the row edge, round the quarter arc, back along the column edge.
  const ex = cx - sx * r;
  const ey = cy - sy * r;
  const sweep = sx * sy > 0 ? 0 : 1;
  return `M${f(cx)} ${f(cy)}H${f(ex)}A${f(r)} ${f(r)} 0 0 ${sweep} ${f(cx)} ${f(ey)}Z`;
}

/** Path data per colour, in paint order. */
export type Layers = Map<string, string>[];

/**
 * Merged cells with rounded outer corners: each run of one colour reads as a
 * single vector shape. A rounded corner inside the picture is backed by the
 * neighbouring colour, and the silhouette's inner corners get fillets. A
 * corner with one empty neighbour and one of another colour stays square, so
 * no notch opens between two colours.
 *
 * @param g - Colour grid
 * @param r - Corner radius, in cells
 * @returns Under-corners, cells and fillets, each grouped by colour
 */
export function softLayers(g: ColourGrid, r: number): Layers {
  const under = new Map<string, string>();
  const cells = new Map<string, string>();
  const fills = new Map<string, string>();
  const add = (m: Map<string, string>, c: string, d: string): void => {
    m.set(c, (m.get(c) ?? '') + d);
  };
  g.forEach((row, y) => {
    row.forEach((c, x) => {
      if (c === null) {
        for (const [sx, sy] of CORNERS) {
          const h = at(g, x + sx, y);
          if (h !== null && h === at(g, x, y + sy) && h === at(g, x + sx, y + sy))
            add(fills, h, fillet(x, y, sx, sy, r));
        }
        return;
      }
      const radii = CORNERS.map(([sx, sy]) => {
        const h = at(g, x + sx, y);
        const v = at(g, x, y + sy);
        if (h === c || v === c) return 0;
        // Half on the silhouette's edge: a rounded corner would cut a notch between two colours.
        if ((h === null) !== (v === null)) return 0;
        if (h !== null && v !== null)
          add(under, h === v ? h : (at(g, x + sx, y + sy) ?? h), cornerBox(x, y, sx, sy, r));
        return r;
      });
      add(cells, c, roundedCell(x, y, radii));
    });
  });
  return [under, cells, fills];
}

/**
 * Lines on the edges between two different colours, for an inked look.
 *
 * @param g - Colour grid
 * @returns Path data, one segment per edge
 */
export function innerEdges(g: ColourGrid): string {
  let d = '';
  g.forEach((row, y) => {
    row.forEach((c, x) => {
      if (c === null) return;
      const right = at(g, x + 1, y);
      const below = at(g, x, y + 1);
      if (right !== null && right !== c) d += `M${x + 1} ${y}v1`;
      if (below !== null && below !== c) d += `M${x} ${y + 1}h1`;
    });
  });
  return d;
}

/**
 * Mixes two hex colours.
 *
 * @param a - `#rrggbb`
 * @param b - `#rrggbb`
 * @param t - Share of `b`, 0 to 1
 * @returns `#rrggbb`
 */
export function mix(a: string, b: string, t: number): string {
  const ch = (hex: string, i: number): number => Number.parseInt(hex.slice(1 + 2 * i, 3 + 2 * i), 16);
  return `#${[0, 1, 2]
    .map((i) =>
      Math.round(ch(a, i) * (1 - t) + ch(b, i) * t)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}
