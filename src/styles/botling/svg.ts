import { checkPalette, settle } from '../../core/options.js';
import { cellStyle, type Outline, padding } from '../../core/render/cell.js';
import { framed, frameFit } from '../../core/render/frame.js';
import { inkFor, innerLines, silhouetteLayers } from '../../core/render/ink.js';
import { lookCell, softExtras, stickerGroup } from '../../core/render/look.js';
import { paintAttrs, pathData } from '../../core/render/path.js';
import { animation } from './animate.js';
import { drawGrid, drawSmallGrid, GRID_SIZE, SMALL_GRID_SIZE } from './grid/index.js';
import { PALETTES } from './palettes.js';
import { SHAPES } from './parts.js';
import { traits } from './traits.js';
import { type BotlingOptions, type Palette, Role, type Traits } from './types.js';

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

/** The palette to paint with: a checked palette object from the options, else the one the traits name. */
const resolvePalette = (t: Traits, opts: BotlingOptions): Palette =>
  typeof opts.palette === 'object' ? checkPalette('botling', opts.palette) : (PALETTES[t.palette] as Palette);

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
  if (opts.animate !== undefined && typeof opts.animate !== 'boolean') {
    throw new RangeError('botling: animate must be true or false');
  }
  const { size, isSmall, showGrid, frame, look } = settle('botling', opts);

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
  const g = c.cells.map((row) => row.map((r) => (r === Role.Empty ? null : colours[r])));
  const groups = new Map<string, Map<string, Outline[]>>([
    [GRID, new Map()],
    ['', new Map()],
  ]);
  // The robot's own cells by group, without the animation's copies, for the look's outline.
  const drawn = new Map<string, Outline[]>();
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
      const cell = lookCell(look, t.shape, g, x, y, isSmall);
      const key = role === Role.Empty ? GRID : (anim?.classOf(role, part, x) ?? '');
      add(key, fill, cell);
      if (role !== Role.Empty) {
        const own = drawn.get(key) ?? [];
        own.push(cell);
        drawn.set(key, own);
      }
      for (const [copy, as] of anim && role !== Role.Empty ? anim.copies(role, part, x, y) : []) {
        add(copy, colours[as as Exclude<Role, 0>], cell);
      }
    }
  }
  const style = cellStyle(t.shape, isSmall || look !== 'gapped');
  const paths = (byColour: Map<string, Outline[]> | undefined): string => {
    let out = '';
    for (const [colour, outlines] of byColour ?? [])
      out += `<path ${paintAttrs(colour, style.paint)} d="${pathData(outlines)}"/>`;
    return out;
  };
  const moving = [...groups.keys()].filter((k) => k !== '' && k !== GRID);
  const wrap = (k: string, inner: string): string =>
    k && inner ? `<g class="${k}"${anim?.attrs(k) ?? ''}>${inner}</g>` : inner;
  const ink = inkFor(p.shade);
  const extras = softExtras(look, t.shape, g);
  let outlines = '';
  // Every group's shadow goes beneath every group's border, as in the still picture.
  const layers = [...drawn].map(
    ([k, list]) => [k, silhouetteLayers(look, t.shape === 'circle', pathData(list), ink)] as const,
  );
  for (const layer of [0, 1]) for (const [k, both] of layers) outlines += wrap(k, both[layer] ?? '');
  let robot = outlines + paths(extras.under) + paths(groups.get('')) + paths(extras.over);
  robot += innerLines(look, t.shape, g, ink);
  for (const k of moving) robot += wrap(k, paths(groups.get(k)));
  if (anim?.wrap && robot) {
    robot = `<g class="${anim.wrap}">${robot}</g>`;
    moving.push(anim.wrap);
  }
  let cells = (GRID ? paths(groups.get(GRID)) : '') + robot;
  if (style.attrs && cells) cells = `<g ${style.attrs}>${cells}</g>`;
  if (look === 'sticker' && cells) cells = stickerGroup(n, cells);

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
