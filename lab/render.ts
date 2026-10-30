import { centreRows } from '../src/grid/canvas.js';
import { cellStyle, type Outline, outline, padding } from '../src/render/cell.js';
import { framed, frameFit } from '../src/render/frame.js';
import { paintAttrs, pathData } from '../src/render/path.js';
import { type Frame, type Palette, Role, type Shape } from '../src/types.js';
import type { Kind } from './kinds/art.js';

/** Options for {@link renderKind}. */
export interface LabOptions {
  size?: number;
  shape?: Shape;
  frame?: Frame;
  /** Draw cells that touch, as the small robot does. */
  solid?: boolean;
  showGrid?: boolean;
}

/**
 * Renders one avatar of a family with the package's own cell, path and
 * frame code, so a prototype looks the way it would if it shipped.
 *
 * @param kind - The family
 * @param seed - Any string
 * @param opts - Size, cell shape and frame
 * @returns A standalone SVG document
 */
export function renderKind<T>(kind: Kind<T>, seed: string, opts: LabOptions = {}): string {
  const t = kind.traits(seed);
  const p: Palette = kind.palette(t);
  const shape = opts.shape ?? kind.shape(t);
  const size = opts.size ?? 96;
  const solid = opts.solid ?? size < 40;
  const showGrid = opts.showGrid ?? !solid;
  const frame = opts.frame ?? 'rounded';
  const c = kind.draw(t);
  centreRows(c, shape === 'triangle');
  const colours: Record<number, string> = {
    [Role.Body]: p.body,
    [Role.Shade]: p.shade,
    [Role.Screen]: p.screen,
    [Role.Glow]: p.glow,
    [Role.Accent]: p.accent,
  };
  const n = c.cells.length;
  const pad = padding(shape);
  const fit = frameFit(frame, shape, n, pad);
  const reach = showGrid ? fit.reach : 0;
  const byColour = new Map<string, Outline[]>();
  for (let y = -reach; y < n + reach; y++) {
    for (let x = -reach; x < n + reach; x++) {
      const role = c.cells[y]?.[x] ?? Role.Empty;
      if (role === Role.Empty && !(showGrid && fit.holds(x, y))) continue;
      const fill = role === Role.Empty ? p.grid : (colours[role] as string);
      const list = byColour.get(fill) ?? [];
      list.push(outline(shape, x, y, solid));
      byColour.set(fill, list);
    }
  }
  const style = cellStyle(shape, solid);
  let cells = '';
  // Grid first, so the picture paints over it.
  const order = [...byColour.keys()].sort((a, b) => Number(b === p.grid) - Number(a === p.grid));
  for (const colour of order) {
    cells += `<path ${paintAttrs(colour, style.paint)} d="${pathData(byColour.get(colour) ?? [])}"/>`;
  }
  if (style.attrs) cells = `<g ${style.attrs}>${cells}</g>`;
  const span = n + 2 * pad;
  const body = framed(frame, fit, n, pad, p.bg, cells);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${span} ${span}" width="${size}" height="${size}" role="img" aria-label="${kind.name} avatar">${body}</svg>`;
}
