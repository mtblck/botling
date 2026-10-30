import { cellStyle, type Outline, outline, padding } from '../../core/render/cell.js';
import { FRAMES, framed, frameFit } from '../../core/render/frame.js';
import { paintAttrs, pathData } from '../../core/render/path.js';
import { animation } from './animate.js';
import { drawGrid, drawSmallGrid, GRID_SIZE, SMALL_GRID_SIZE } from './grid/index.js';
import { PALETTES } from './palettes.js';
import { SHAPES } from './parts.js';
import { traits } from './traits.js';
import { type BotlingOptions, type Detail, type Palette, Role, type Traits } from './types.js';

/**
 * Below this size the 15x15 robot reads as noise, so `detail: 'auto'` draws
 * the small robot and `showGrid: 'auto'` hides the empty grid.
 */
const AUTO_FULL_MIN_SIZE = 40;
const DETAILS: readonly Detail[] = ['auto', 'full', 'small'];

const escapeXml = (s: string): string => s.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);

/**
 * Applies option overrides to a seed's traits, rejecting values that would
 * otherwise fail quietly. With a palette object, `palette` stays the seed's
 * own index: the object is drawn, but it isn't one of {@link PALETTES}.
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
  if (opts.palette !== undefined && typeof opts.palette !== 'object') {
    if (!Number.isInteger(opts.palette) || opts.palette < 0 || opts.palette >= PALETTES.length) {
      throw new RangeError(`botling: palette must be an integer from 0 to ${PALETTES.length - 1}, or a palette object`);
    }
    t.palette = opts.palette;
  }
  return t;
}

const HEX = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const PALETTE_KEYS = ['bg', 'grid', 'body', 'shade', 'screen', 'glow', 'accent'] as const;

/**
 * The palette to paint with: a palette object from the options, else the
 * built-in palette the traits name. Object colours go straight into SVG
 * attributes, so anything but a hex colour is rejected.
 */
function resolvePalette(t: Traits, opts: BotlingOptions): Palette {
  const custom: unknown = opts.palette;
  if (typeof custom !== 'object') return PALETTES[t.palette] as Palette;
  if (custom === null || Array.isArray(custom)) {
    throw new RangeError('botling: palette must be an index into PALETTES or a palette object');
  }
  // Read each colour once into a copy, so a getter can't pass the check and then change.
  const source = custom as Record<string, unknown>;
  const checked: Palette = { name: String(source.name ?? 'Custom') } as Palette;
  for (const key of PALETTE_KEYS) {
    const colour = source[key];
    if (typeof colour !== 'string' || !HEX.test(colour)) {
      throw new RangeError(`botling: palette.${key} must be a hex colour such as #1d1210`);
    }
    checked[key] = colour;
  }
  return checked;
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
  const p = resolvePalette(t, opts);
  const colours = roleColours(p, t);
  const size = opts.size ?? 96;
  if (typeof size !== 'number' || !Number.isFinite(size) || size <= 0) {
    throw new RangeError('botling: size must be a positive, finite number');
  }
  const detail = opts.detail ?? 'auto';
  if (!DETAILS.includes(detail)) throw new RangeError(`botling: unknown detail "${String(detail)}"`);
  const isSmall = detail === 'small' || (detail === 'auto' && size < AUTO_FULL_MIN_SIZE);
  const showGrid =
    !isSmall && (opts.showGrid === 'auto' || opts.showGrid === undefined ? size >= AUTO_FULL_MIN_SIZE : opts.showGrid);
  if (opts.animate !== undefined && typeof opts.animate !== 'boolean') {
    throw new RangeError('botling: animate must be true or false');
  }
  const frame = opts.frame ?? 'square';
  if (!FRAMES.includes(frame)) throw new RangeError(`botling: unknown frame "${String(frame)}"`);

  // One path per colour keeps the picture (cells don't overlap, bar the
  // hairline bleed on solid cells) and saves an element per cell. Animated,
  // the grid and each moving class get paths of their own.
  const c = isSmall ? drawSmallGrid(t) : drawGrid(t);
  const n = isSmall ? SMALL_GRID_SIZE : GRID_SIZE;
  const pad = padding(t.shape);
  const fit = frameFit(frame, t.shape, n, pad);
  // A shrunk robot leaves room in its frame, which the grid fills past its 15x15.
  const reach = showGrid ? fit.reach : 0;
  const anim = opts.animate ? animation(seed, t, isSmall) : null;
  const GRID = anim ? 'grid' : '';
  const groups = new Map<string, Map<string, Outline[]>>([
    [GRID, new Map()],
    ['', new Map()],
  ]);
  const add = (key: string, fill: string, cell: Outline): void => {
    const byColour = groups.get(key) ?? new Map<string, Outline[]>();
    groups.set(key, byColour);
    const outlines = byColour.get(fill) ?? [];
    outlines.push(cell);
    byColour.set(fill, outlines);
  };
  for (let y = -reach; y < n + reach; y++) {
    for (let x = -reach; x < n + reach; x++) {
      const role = c.cells[y]?.[x] ?? Role.Empty;
      if (role === Role.Empty && !(showGrid && fit.holds(x, y))) continue;
      const fill = role === Role.Empty ? p.grid : colours[role];
      const part = c.parts[y]?.[x] ?? null;
      const cell = outline(t.shape, x, y, isSmall);
      add(role === Role.Empty ? GRID : (anim?.classOf(role, part, x) ?? ''), fill, cell);
      for (const [key, as] of anim && role !== Role.Empty ? anim.copies(role, part, x, y) : []) {
        add(key, colours[as as Exclude<Role, 0>], cell);
      }
    }
  }
  const style = cellStyle(t.shape, isSmall);
  const paths = (key: string): string => {
    let out = '';
    for (const [colour, outlines] of groups.get(key) ?? [])
      out += `<path ${paintAttrs(colour, style.paint)} d="${pathData(outlines)}"/>`;
    return out;
  };
  const moving = [...groups.keys()].filter((k) => k !== '' && k !== GRID);
  let robot = paths('');
  for (const k of moving) robot += `<g class="${k}"${anim?.attrs(k) ?? ''}>${paths(k)}</g>`;
  if (anim?.wrap && robot) {
    robot = `<g class="${anim.wrap}">${robot}</g>`;
    moving.push(anim.wrap);
  }
  let cells = (GRID ? paths(GRID) : '') + robot;
  if (style.attrs && cells) cells = `<g ${style.attrs}>${cells}</g>`;

  const span = n + 2 * pad;
  const title = opts.title === undefined ? 'Robot avatar' : opts.title;
  const a11y = title === null ? 'aria-hidden="true"' : `role="img" aria-label="${escapeXml(title)}"`;
  const css = anim?.css(moving) ?? '';
  const body = framed(frame, fit, n, pad, opts.background === false ? null : p.bg, cells);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${span} ${span}" width="${size}" height="${size}" ${a11y}>${css}${body}</svg>`;
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
