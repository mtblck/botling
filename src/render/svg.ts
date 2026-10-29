import { GRID_SIZE, grid } from '../grid/index.js';
import { PALETTES } from '../palettes.js';
import { SHAPES } from '../parts.js';
import { traits } from '../traits.js';
import { type BotlingOptions, type Palette, Role, type Traits } from '../types.js';
import { cell, padding } from './cell.js';

/** Below this size the empty grid reads as noise, so `showGrid: 'auto'` hides it. */
const AUTO_GRID_MIN_SIZE = 40;

const escapeXml = (s: string): string => s.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);

/**
 * Applies option overrides to a seed's traits, rejecting values that would
 * otherwise fail quietly.
 *
 * @param seed - Any string
 * @param opts - Caller options
 * @returns Traits to draw
 */
export function resolveTraits(seed: string, opts: BotlingOptions = {}): Traits {
  const t = traits(seed);
  if (opts.shape !== undefined) {
    if (!SHAPES.includes(opts.shape)) throw new RangeError(`botling: unknown shape "${String(opts.shape)}"`);
    t.shape = opts.shape;
  }
  if (opts.palette !== undefined) {
    if (!Number.isInteger(opts.palette) || opts.palette < 0 || opts.palette >= PALETTES.length) {
      throw new RangeError(`botling: palette must be an integer from 0 to ${PALETTES.length - 1}`);
    }
    t.palette = opts.palette;
  }
  return t;
}

/**
 * Maps each role to its colour. Without a screen, eyes and mouth are cut out
 * in the screen colour instead of glowing.
 */
function roleColours(p: Palette, t: Traits): Record<Exclude<Role, 0>, string> {
  return {
    [Role.Body]: p.body,
    [Role.Screen]: p.screen,
    [Role.Glow]: t.hasScreen ? p.glow : p.screen,
    [Role.Accent]: p.accent,
    [Role.Shade]: p.shade,
  };
}

/**
 * Renders the robot for a seed as an SVG string. Same seed and options, same
 * SVG, for as long as the major version stays the same.
 *
 * @param seed - Any string, such as a user id
 * @param opts - Rendering options
 * @returns A standalone SVG document
 */
export function botling(seed: string, opts: BotlingOptions = {}): string {
  const t = resolveTraits(seed, opts);
  const p = PALETTES[t.palette] as Palette;
  const colours = roleColours(p, t);
  const size = opts.size ?? 96;
  if (!(size > 0)) throw new RangeError('botling: size must be a positive number');
  const showGrid = opts.showGrid === 'auto' || opts.showGrid === undefined ? size >= AUTO_GRID_MIN_SIZE : opts.showGrid;

  // Cells never overlap, so grouping them by colour keeps the picture and
  // saves repeating a fill attribute on every cell.
  const roles = grid(t);
  const byColour = new Map<string, string>();
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const role = roles[y]?.[x] ?? Role.Empty;
      if (role === Role.Empty && !showGrid) continue;
      const fill = role === Role.Empty ? p.grid : colours[role];
      byColour.set(fill, (byColour.get(fill) ?? '') + cell(t.shape, x, y));
    }
  }
  let cells = '';
  for (const [fill, els] of byColour) cells += `<g fill="${fill}">${els}</g>`;

  const pad = padding(t.shape);
  const span = GRID_SIZE + 2 * pad;
  const title = opts.title === undefined ? 'Robot avatar' : opts.title;
  const a11y = title === null ? 'aria-hidden="true"' : `role="img" aria-label="${escapeXml(title)}"`;
  const bg =
    opts.background === false ? '' : `<rect x="${-pad}" y="${-pad}" width="${span}" height="${span}" fill="${p.bg}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${span} ${span}" width="${size}" height="${size}" ${a11y}>${bg}${cells}</svg>`;
}

/**
 * Renders the robot for a seed as a `data:` URI, ready for an `<img src>` or
 * CSS `url()`.
 *
 * @param seed - Any string, such as a user id
 * @param opts - Rendering options
 * @returns A `data:image/svg+xml` URI
 */
export function botlingDataUri(seed: string, opts: BotlingOptions = {}): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(botling(seed, opts))}`;
}
