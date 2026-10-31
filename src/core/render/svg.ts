import type { Settled } from '../options.js';
import { type Palette, Role, type RoleGrid, type Shape } from '../types.js';
import { cellStyle, type Outline, outline, padding } from './cell.js';
import { framed, frameFit } from './frame.js';
import { paintAttrs, pathData } from './path.js';

/** One still avatar, ready to draw. */
export interface Picture {
  cells: RoleGrid;
  shape: Shape;
  palette: Palette;
  /** Draw the palette's background. */
  background: boolean;
  /** Accessible name; `null` marks the image decorative. */
  title: string | null;
}

const escapeXml = (s: string): string => s.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);

/**
 * Draws a grid of roles as a standalone SVG: one path per colour, in the
 * cell shape, inside the frame. Small avatars draw touching cells.
 *
 * @param pic - The cells, shape, palette and title
 * @param s - Settled size, detail, grid and frame
 * @returns A standalone SVG document
 */
export function stillSvg(pic: Picture, s: Settled): string {
  const p = pic.palette;
  const colours: Record<number, string> = {
    [Role.Body]: p.body,
    [Role.Screen]: p.screen,
    [Role.Glow]: p.glow,
    [Role.Accent]: p.accent,
    [Role.Shade]: p.shade,
  };
  const n = pic.cells.length;
  const pad = padding(pic.shape);
  const fit = frameFit(s.frame, pic.shape, n, pad);
  const reach = s.showGrid ? fit.reach : 0;
  const byColour = new Map<string, Outline[]>();
  for (let y = -reach; y < n + reach; y++) {
    for (let x = -reach; x < n + reach; x++) {
      const role = pic.cells[y]?.[x] ?? Role.Empty;
      if (role === Role.Empty && !(s.showGrid && fit.holds(x, y))) continue;
      const fill = role === Role.Empty ? p.grid : (colours[role] as string);
      const list = byColour.get(fill) ?? [];
      list.push(outline(pic.shape, x, y, s.isSmall));
      byColour.set(fill, list);
    }
  }
  const style = cellStyle(pic.shape, s.isSmall);
  let cells = '';
  // The grid first, so the picture paints over it.
  const order = [...byColour.keys()].sort((a, b) => Number(b === p.grid) - Number(a === p.grid));
  for (const colour of order)
    cells += `<path ${paintAttrs(colour, style.paint)} d="${pathData(byColour.get(colour) ?? [])}"/>`;
  if (style.attrs && cells) cells = `<g ${style.attrs}>${cells}</g>`;
  const span = n + 2 * pad;
  const a11y = pic.title === null ? 'aria-hidden="true"' : `role="img" aria-label="${escapeXml(pic.title)}"`;
  const body = framed(s.frame, fit, n, pad, pic.background ? p.bg : null, cells);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${span} ${span}" width="${s.size}" height="${s.size}" ${a11y}>${body}</svg>`;
}
