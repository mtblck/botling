import { centreRows } from '../../core/canvas.js';
import { type CommonOptions, checkPalette, settle } from '../../core/options.js';
import { stillSvg } from '../../core/render/svg.js';
import { drawGrid, drawSmallGrid } from './grid/index.js';
import { PALETTES } from './palettes.js';
import { SHAPES } from './parts.js';
import { traits } from './traits.js';
import type { Palette, SnootOptions, SnootTraits } from './types.js';

/**
 * Applies the `shape` and numeric `palette` options to a seed's traits,
 * rejecting values that would otherwise fail quietly.
 *
 * @param seed - Any string
 * @param opts - Caller options
 * @returns Traits to draw
 */
export function resolveTraits(seed: string, opts: SnootOptions = {}): SnootTraits {
  const t = traits(seed);
  if (opts.shape !== undefined) {
    if (!SHAPES.includes(opts.shape)) throw new RangeError(`snoot: unknown shape "${String(opts.shape)}"`);
    t.shape = opts.shape;
  }
  if (opts.palette !== undefined && typeof opts.palette !== 'object') {
    if (!Number.isInteger(opts.palette) || opts.palette < 0 || opts.palette >= PALETTES.length) {
      throw new RangeError(`snoot: palette must be an integer from 0 to ${PALETTES.length - 1}, or a palette object`);
    }
    t.palette = opts.palette;
  }
  return t;
}

/**
 * Renders the Snoot for a seed as an SVG string. Snoot is a Preview style:
 * until it's marked stable, the Snoot a seed draws can change in a minor.
 *
 * @param seed - Any string, such as a user id
 * @param opts - Rendering options
 * @returns A standalone SVG document
 */
export function snoot(seed: string, opts: SnootOptions = {}): string {
  const t = resolveTraits(seed, opts);
  const palette: Palette =
    typeof opts.palette === 'object' ? checkPalette('snoot', opts.palette) : (PALETTES[t.palette] as Palette);
  const s = settle('snoot', opts as CommonOptions);
  const c = s.isSmall ? drawSmallGrid(t) : drawGrid(t);
  centreRows(c, t.shape === 'triangle');
  const title = opts.title === undefined ? 'Animal avatar' : opts.title;
  return stillSvg({ cells: c.cells, shape: t.shape, palette, background: opts.background !== false, title }, s);
}

/**
 * Renders the Snoot for a seed as a `data:` URI, for an `<img src>` or CSS `url()`.
 *
 * @param seed - Any string, such as a user id
 * @param opts - Rendering options
 * @returns A `data:image/svg+xml` URI
 */
export function snootDataUri(seed: string, opts: SnootOptions = {}): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(snoot(seed, opts))}`;
}
