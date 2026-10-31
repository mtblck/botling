import type { Look, Shape } from '../types.js';
import { type Outline, outline, type Point } from './cell.js';

/** Every look, the default first. A seed never picks one. */
export const LOOKS: readonly Look[] = Object.freeze(['gapped', 'flat', 'inked', 'soft', 'soft-inked', 'sticker']);

/** A colour per cell, or null where the cell is empty, indexed `[row][column]`. */
export type ColourGrid = readonly (readonly (string | null)[])[];

/** Corner radius of a soft cell, in thousandths: half a cell, so a lone cell is round. */
const SOFT = 500;
/** How far soft shapes reach under their neighbours, in thousandths, so anti-aliasing leaves no seam. */
const BLEED = 10;
/** How far a sticker's picture shrinks to make room for its border and shadow. */
export const STICKER_SCALE = 0.86;

const isSoft = (look: Look, shape: Shape): boolean =>
  shape === 'square' && (look === 'soft' || look === 'soft-inked' || look === 'sticker');
export const at = (g: ColourGrid, x: number, y: number): string | null => g[y]?.[x] ?? null;
/** Corners clockwise from top left, as steps toward each. */
const CORNERS = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
] as const;

/**
 * Whether a corner of a soft cell is rounded. It is when both neighbours
 * beside it share one other colour (or are both empty, on the silhouette's
 * edge), so whatever shows in the curve is that colour, unless the cell
 * across the corner shares the cell's own, so a diagonal run stays joined.
 * Where three or four colours meet, the corner stays square: rounding there
 * left a pinwheel of backing colours and hairline seams.
 */
function rounds(g: ColourGrid, x: number, y: number, sx: number, sy: number): boolean {
  const c = at(g, x, y);
  const h = at(g, x + sx, y);
  return h !== c && h === at(g, x, y + sy) && at(g, x + sx, y + sy) !== c;
}

/**
 * The outline of one cell in a look. Gapless looks draw solid cells; soft
 * ones round the corners where a run of one colour turns outward.
 *
 * @param look - The look
 * @param shape - Cell shape
 * @param g - Colours of the whole picture, for a soft cell's neighbours
 * @param x - Column
 * @param y - Row
 * @param isSolid - Cells touch even in the gapped look, as small avatars' do
 * @returns The cell's points, clockwise
 */
export function lookCell(look: Look, shape: Shape, g: ColourGrid, x: number, y: number, isSolid: boolean): Outline {
  if (!isSoft(look, shape) || at(g, x, y) === null) return outline(shape, x, y, isSolid || look !== 'gapped');
  const [tl, tr, br, bl] = CORNERS.map(([sx, sy]) => (rounds(g, x, y, sx, sy) ? SOFT : 0)) as [
    number,
    number,
    number,
    number,
  ];
  // Each side reaches BLEED past the cell, so neighbours overlap and no seam shows between them.
  const L = x * 1000 - BLEED;
  const T = y * 1000 - BLEED;
  const R = (x + 1) * 1000 + BLEED;
  const B = (y + 1) * 1000 + BLEED;
  const pts: Point[] = [
    [L + tl, T],
    [R - tr, T],
  ];
  if (tr) pts.push([R, T + tr, tr]);
  pts.push([R, B - br]);
  if (br) pts.push([R - br, B, br]);
  pts.push([L + bl, B]);
  if (bl) pts.push([L, B - bl, bl]);
  pts.push([L, T + tl]);
  if (tl) pts.push([L + tl, T, tl]);
  // Drop points that repeat the one before, where a corner is square.
  return pts.filter((p, i) => i === 0 || p[0] !== pts[i - 1]?.[0] || p[1] !== pts[i - 1]?.[1]);
}

/**
 * What fills in behind and around soft cells: under each rounded corner
 * inside the picture, a square of the neighbouring colour; in each empty
 * cell whose corner the picture wraps round, a fillet, so inner corners
 * curve too. Other looks have none.
 *
 * @param look - The look
 * @param shape - Cell shape
 * @param g - Colours of the whole picture
 * @returns Backing and fillet outlines, each grouped by colour
 */
export function softExtras(
  look: Look,
  shape: Shape,
  g: ColourGrid,
): { under: Map<string, Outline[]>; over: Map<string, Outline[]> } {
  const under = new Map<string, Outline[]>();
  const over = new Map<string, Outline[]>();
  if (!isSoft(look, shape)) return { under, over };
  const add = (m: Map<string, Outline[]>, colour: string, o: Outline): void => {
    const list = m.get(colour) ?? [];
    list.push(o);
    m.set(colour, list);
  };
  g.forEach((row, y) => {
    row.forEach((c, x) => {
      for (const [sx, sy] of CORNERS) {
        // The cell's corner toward (sx, sy).
        const cx = (x + (sx > 0 ? 1 : 0)) * 1000;
        const cy = (y + (sy > 0 ? 1 : 0)) * 1000;
        const h = at(g, x + sx, y);
        const v = at(g, x, y + sy);
        // Both reach BLEED past the cell's edges, under the neighbours beside the corner.
        const ox = cx + sx * BLEED;
        const oy = cy + sy * BLEED;
        if (c === null) {
          if (h === null || h !== v || h !== at(g, x + sx, y + sy)) continue;
          const along: Point = [cx - sx * SOFT, oy];
          const down: Point = [ox, cy - sy * SOFT];
          // Traced so the arc turns clockwise.
          const [a, b] = sx === sy ? [down, along] : [along, down];
          add(over, h, [[ox, oy], a, [b[0], b[1], SOFT]]);
        } else if (h !== null && rounds(g, x, y, sx, sy)) {
          // Rounding needs both neighbours in one colour, so that colour backs the curve.
          const back = h;
          const ix = cx - sx * (SOFT + BLEED);
          const iy = cy - sy * (SOFT + BLEED);
          add(under, back, [
            [ox, oy],
            [ix, oy],
            [ix, iy],
            [ox, iy],
          ]);
        }
      }
    });
  });
  return { under, over };
}

/**
 * Shrinks a sticker's picture about the grid's centre, to make room for its
 * border and shadow.
 *
 * @param n - Grid size, in cells
 * @param cells - The picture's SVG
 * @returns The picture in a scaling group
 */
export function stickerGroup(n: number, cells: string): string {
  const e = Math.round((n / 2) * (1 - STICKER_SCALE) * 1000) / 1000;
  return `<g transform="matrix(${STICKER_SCALE} 0 0 ${STICKER_SCALE} ${e} ${e})">${cells}</g>`;
}
