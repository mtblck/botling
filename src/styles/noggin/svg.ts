import { centreRows } from '../../core/canvas.js';
import { type CommonOptions, checkPalette, settle } from '../../core/options.js';
import { stillSvg } from '../../core/render/svg.js';
import { drawGrid, drawSmallGrid } from './grid/index.js';
import { PALETTES, paletteFor, SKIN_TONES } from './palettes.js';
import { SHAPES } from './parts.js';
import { hairFor, outfitFor, traits } from './traits.js';
import type { NogginOptions, NogginTraits, Palette } from './types.js';

/** Checks an index option, so a bad value fails loudly instead of drawing nothing. */
function index(name: string, value: unknown, length: number, extra = ''): number {
  if (!Number.isInteger(value) || (value as number) < 0 || (value as number) >= length) {
    throw new RangeError(`noggin: ${name} must be an integer from 0 to ${length - 1}${extra}`);
  }
  return value as number;
}

/**
 * Applies the `shape`, `skin` and numeric `palette` options to a seed's
 * traits, rejecting values that would otherwise fail quietly. A new skin
 * tone moves the hair colour, and the outfit unless one is given, to the
 * next that stands out from it.
 *
 * @param seed - Any string
 * @param opts - Caller options
 * @returns Traits to draw
 */
export function resolveTraits(seed: string, opts: NogginOptions = {}): NogginTraits {
  const t = traits(seed);
  if (opts.shape !== undefined) {
    if (!SHAPES.includes(opts.shape)) throw new RangeError(`noggin: unknown shape "${String(opts.shape)}"`);
    t.shape = opts.shape;
  }
  if (opts.skin !== undefined) {
    t.skin = index('skin', opts.skin, SKIN_TONES.length);
    t.hairColour = hairFor(t.skin, t.hairColour);
    t.palette = outfitFor(t.skin, t.palette);
  }
  if (opts.palette !== undefined && typeof opts.palette !== 'object') {
    t.palette = index('palette', opts.palette, PALETTES.length, ', or a palette object');
  }
  return t;
}

/**
 * Renders the Noggin for a seed as an SVG string. Noggin is a Preview style:
 * until it's marked stable, the Noggin a seed draws can change in a minor.
 *
 * @param seed - Any string, such as a user id
 * @param opts - Rendering options
 * @returns A standalone SVG document
 */
export function noggin(seed: string, opts: NogginOptions = {}): string {
  const t = resolveTraits(seed, opts);
  const palette: Palette =
    typeof opts.palette === 'object'
      ? checkPalette('noggin', opts.palette)
      : paletteFor(t.palette, t.skin, t.hairColour);
  const s = settle('noggin', opts as CommonOptions);
  const c = s.isSmall ? drawSmallGrid(t) : drawGrid(t);
  centreRows(c, t.shape === 'triangle');
  const title = opts.title === undefined ? 'Person avatar' : opts.title;
  return stillSvg({ cells: c.cells, shape: t.shape, palette, background: opts.background !== false, title }, s);
}

/**
 * Renders the Noggin for a seed as a `data:` URI, for an `<img src>` or CSS `url()`.
 *
 * @param seed - Any string, such as a user id
 * @param opts - Rendering options
 * @returns A `data:image/svg+xml` URI
 */
export function nogginDataUri(seed: string, opts: NogginOptions = {}): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(noggin(seed, opts))}`;
}
