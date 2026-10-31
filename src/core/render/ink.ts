import type { Look, Shape } from '../types.js';
import { at, type ColourGrid } from './look.js';
import { num } from './path.js';

/** Width of the dark outline round an inked avatar, and of the lines between its colours, in thousandths. */
const INK = 420;
const INNER_INK = 120;
/** A sticker's white border and its shadow's offset, in thousandths, and the shadow's opacity. */
const BORDER = 1100;
const SHADOW = 350;
const SHADOW_OPACITY = 0.22;

/**
 * Darkens a hex colour toward black for ink, ignoring any alpha.
 *
 * @param hex - A hex colour, 3, 4, 6 or 8 digits
 * @returns A 6-digit hex colour
 */
export function inkFor(hex: string): string {
  const digits = hex.slice(1);
  const full = digits.length <= 4 ? [...digits].map((d) => d + d).join('') : digits;
  let out = '#';
  for (let i = 0; i < 3; i++) {
    const v = Math.round(Number.parseInt(full.slice(2 * i, 2 * i + 2), 16) * 0.38);
    out += v.toString(16).padStart(2, '0');
  }
  return out;
}

/**
 * What a look draws beneath a group of cells: a sticker's shadow and white
 * border, or an inked outline. Each is the cells' own outlines, stroked wide
 * with round joins, so only the part outside the cells shows.
 *
 * @param look - The look
 * @param isDot - Cells are round dots, drawn as strokes
 * @param d - Path data of the group's cells
 * @param ink - The ink colour
 * @returns SVG elements, or an empty string
 */
export function silhouette(look: Look, isDot: boolean, d: string, ink: string): string {
  if (!d || (look !== 'sticker' && look !== 'inked' && look !== 'soft-inked')) return '';
  const dot = isDot ? 1000 : 0;
  const caps = isDot ? ' stroke-linecap="round"' : '';
  const stroke = (colour: string, width: number, extra = ''): string =>
    `<path${extra} fill="${colour}" stroke="${colour}" stroke-width="${num(width + dot)}" stroke-linejoin="round"${caps} d="${d}"/>`;
  if (look !== 'sticker') return stroke(ink, INK);
  const off = num(SHADOW);
  return (
    stroke('#000', BORDER, ` transform="translate(${off} ${off})" opacity="${num(SHADOW_OPACITY * 1000)}"`) +
    stroke('#fff', BORDER)
  );
}

/**
 * An inked avatar's thin lines between two colours, on square cells only:
 * one line per run of edges.
 *
 * @param look - The look
 * @param shape - Cell shape
 * @param g - Colours of the whole picture
 * @param ink - The ink colour
 * @returns A `<path>`, or an empty string
 */
export function innerLines(look: Look, shape: Shape, g: ColourGrid, ink: string): string {
  if (look !== 'inked' || shape !== 'square') return '';
  const differs = (a: string | null, b: string | null): boolean => a !== null && b !== null && a !== b;
  let d = '';
  const n = g.length;
  for (let i = 1; i < n; i++) {
    // Row edge i runs along the top of row i; column edge i down the left of column i.
    for (const across of [true, false]) {
      let start = -1;
      for (let j = 0; j <= n; j++) {
        const on = j < n && (across ? differs(at(g, j, i - 1), at(g, j, i)) : differs(at(g, i - 1, j), at(g, i, j)));
        if (on && start < 0) start = j;
        if (!on && start >= 0) {
          d += across ? `M${start} ${i}h${j - start}` : `M${i} ${start}v${j - start}`;
          start = -1;
        }
      }
    }
  }
  return d
    ? `<path fill="none" stroke="${ink}" stroke-width="${num(INNER_INK)}" stroke-linecap="square" d="${d}"/>`
    : '';
}
