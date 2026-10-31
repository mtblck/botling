import { type Canvas, centreRows, type Part } from '../canvas.js';
import type { Settled } from '../options.js';
import { Role } from '../types.js';
import { cellStyle, type Outline, padding } from './cell.js';
import { frameFit } from './frame.js';
import { inkFor, innerLines, silhouette } from './ink.js';
import { lookCell, softExtras, stickerGroup } from './look.js';
import { type Animation, animation, type MotionPlan } from './motion.js';
import { paintAttrs, pathData } from './path.js';
import { type Picture, roleColours, stillSvg, svgDocument } from './svg.js';

/**
 * Draws a moving avatar: like `stillSvg`, but each moving class gets paths
 * of its own, lids sit under blinking and talking cells, and a group around
 * the whole avatar hovers. The picture at rest is the still one.
 *
 * @param pic - The cells, shape, palette and title
 * @param parts - The part each cell belongs to, indexed like `pic.cells`
 * @param anim - Which class each cell moves in, and the style for them
 * @param s - Settled size, detail, grid, frame and look
 * @returns A standalone SVG document
 */
export function animatedSvg(pic: Picture, parts: readonly (readonly Part[])[], anim: Animation, s: Settled): string {
  const p = pic.palette;
  const colours = roleColours(p);
  const n = pic.cells.length;
  const fit = frameFit(s.frame, pic.shape, n, padding(pic.shape));
  const reach = s.showGrid ? fit.reach : 0;
  const g = pic.cells.map((row) => row.map((r) => (r === Role.Empty ? null : (colours[r] as string))));
  const GRID = 'grid';
  const groups = new Map<string, Map<string, Outline[]>>([
    [GRID, new Map()],
    ['', new Map()],
  ]);
  // The avatar's own cells by group, without the lids, for the look's outline.
  const drawn = new Map<string, Outline[]>();
  const add = (key: string, fill: string, cell: Outline): void => {
    const byColour = groups.get(key) ?? new Map<string, Outline[]>();
    groups.set(key, byColour);
    byColour.set(fill, [...(byColour.get(fill) ?? []), cell]);
  };
  for (let y = -reach; y < n + reach; y++) {
    for (let x = -reach; x < n + reach; x++) {
      const role = pic.cells[y]?.[x] ?? Role.Empty;
      if (role === Role.Empty && !(s.showGrid && fit.holds(x, y))) continue;
      const cell = lookCell(s.look, pic.shape, g, x, y, s.isSmall);
      if (role === Role.Empty) {
        add(GRID, p.grid, cell);
        continue;
      }
      const part = parts[y]?.[x] ?? null;
      const key = anim.classOf(role, part, x) ?? '';
      add(key, colours[role] as string, cell);
      drawn.set(key, [...(drawn.get(key) ?? []), cell]);
      for (const [copy, as] of anim.copies(role, part, x, y)) add(copy, colours[as] as string, cell);
    }
  }
  const style = cellStyle(pic.shape, s.isSmall || s.look !== 'gapped');
  const paths = (byColour: Map<string, Outline[]> | undefined): string => {
    let out = '';
    for (const [colour, outlines] of byColour ?? [])
      out += `<path ${paintAttrs(colour, style.paint)} d="${pathData(outlines)}"/>`;
    return out;
  };
  const moving = [...groups.keys()].filter((k) => k !== '' && k !== GRID);
  const wrap = (k: string, inner: string): string =>
    k && inner ? `<g class="${k}"${anim.attrs(k)}>${inner}</g>` : inner;
  const ink = inkFor(p.shade);
  const extras = softExtras(s.look, pic.shape, g);
  let avatar = '';
  for (const [k, list] of drawn) avatar += wrap(k, silhouette(s.look, pic.shape === 'circle', pathData(list), ink));
  avatar += paths(extras.under) + paths(groups.get('')) + paths(extras.over);
  avatar += innerLines(s.look, pic.shape, g, ink);
  for (const k of moving) avatar += wrap(k, paths(groups.get(k)));
  if (anim.wrap && avatar) {
    avatar = `<g class="${anim.wrap}">${avatar}</g>`;
    moving.push(anim.wrap);
  }
  let cells = paths(groups.get(GRID)) + avatar;
  if (style.attrs && cells) cells = `<g ${style.attrs}>${cells}</g>`;
  if (s.look === 'sticker' && cells) cells = stickerGroup(n, cells);
  return svgDocument(pic, s, fit, cells, anim.css(moving));
}

/**
 * Draws a style's avatar from its canvas: centred, then still, or moving
 * when the options ask for it.
 *
 * @param c - The drawn canvas, whose parts say what moves
 * @param pic - Everything but the cells: shape, palette, background and title
 * @param s - Settled options
 * @param plan - The style, salted seed, moving parts and lid colour
 * @returns A standalone SVG document
 */
export function avatarSvg(
  c: Canvas,
  pic: Omit<Picture, 'cells'>,
  s: Settled,
  plan: Omit<MotionPlan, 'size' | 'isSmall'>,
): string {
  centreRows(c, pic.shape === 'triangle');
  const full = { ...pic, cells: c.cells };
  if (!s.animate) return stillSvg(full, s);
  return animatedSvg(full, c.parts, animation({ ...plan, size: c.cells.length, isSmall: s.isSmall }), s);
}
