import { centreRows } from '../../src/core/canvas.js';
import { outline, padding } from '../../src/core/render/cell.js';
import { framed, frameFit } from '../../src/core/render/frame.js';
import { pathData } from '../../src/core/render/path.js';
import { type Frame, Role, type Shape } from '../../src/core/types.js';
import type { Kind } from '../kinds/art.js';
import { renderKind } from '../render.js';
import { colourGrid, innerEdges, mix, softLayers } from './geometry.js';

/** A render look for the same cells. */
export type Look = 'gapped' | 'flat' | 'inked' | 'soft' | 'soft-inked' | 'sticker';

/** Every look, in the order the comparison shows them. */
export const LOOKS: readonly Look[] = ['gapped', 'flat', 'inked', 'soft', 'soft-inked', 'sticker'];

/** Options for {@link renderLook}. */
export interface LookOptions {
  size?: number;
  shape?: Shape;
  frame?: Frame;
}

/** Ink width, in cells; half of it shows outside the silhouette. */
const INK = 0.42;
/** Width of the ink lines between colours. */
const INNER_INK = 0.12;
/** Corner radius of a soft cell. */
const SOFT_RADIUS = 0.5;
/** Sticker border width and shadow offset, in cells, and how much the picture shrinks to fit them. */
const STICKER = { border: 1.1, shadow: 0.35, scale: 0.86 };

/**
 * Renders one avatar of a family in a look. `gapped` is today's renderer;
 * the rest draw the same cells touching, so the picture reads as flat art.
 *
 * @param kind - The family
 * @param seed - Any string
 * @param look - The look
 * @param opts - Size, cell shape and frame
 * @returns A standalone SVG document
 */
export function renderLook<T>(kind: Kind<T>, seed: string, look: Look, opts: LookOptions = {}): string {
  const size = opts.size ?? 96;
  const frame = opts.frame ?? 'rounded';
  if (look === 'gapped')
    return renderKind(kind, seed, {
      size,
      frame,
      ...(opts.shape ? { shape: opts.shape } : {}),
      solid: false,
      showGrid: true,
    });
  const t = kind.traits(seed);
  const p = kind.palette(t);
  const shape = opts.shape ?? kind.shape(t);
  const c = kind.draw(t);
  centreRows(c, shape === 'triangle');
  const colours = {
    [Role.Body]: p.body,
    [Role.Shade]: p.shade,
    [Role.Screen]: p.screen,
    [Role.Glow]: p.glow,
    [Role.Accent]: p.accent,
  };
  const g = colourGrid(c.cells, colours);
  const ink = mix(p.shade, '#000000', 0.62);
  const isSoft = (look === 'soft' || look === 'soft-inked' || look === 'sticker') && shape === 'square';

  // Fill paths per colour, in paint order, and the silhouette as one path.
  const layers: Map<string, string>[] = [];
  let silhouette = '';
  if (isSoft) {
    layers.push(...softLayers(g, SOFT_RADIUS));
    // Soft paths are absolute, so they join into one.
    silhouette = layers.flatMap((m) => [...m.values()]).join('');
  } else {
    const byColour = new Map<string, ReturnType<typeof outline>[]>();
    g.forEach((row, y) => {
      row.forEach((col, x) => {
        if (col !== null) byColour.set(col, [...(byColour.get(col) ?? []), outline(shape, x, y, true)]);
      });
    });
    const flat = new Map<string, string>();
    for (const [col, list] of byColour) flat.set(col, pathData(list));
    layers.push(flat);
    // Path data is relative, so the silhouette is built from every cell at once.
    silhouette = pathData([...byColour.values()].flat());
  }
  // Round cells are dots: zero-length lines with round caps, one cell wide.
  const isDot = shape === 'circle';
  const paint = (col: string): string => (isDot ? `fill="none" stroke="${col}"` : `fill="${col}"`);
  const fills = layers.map((m) => [...m].map(([col, d]) => `<path ${paint(col)} d="${d}"/>`).join('')).join('');
  const dot = isDot ? 1 : 0;

  let art = '';
  if (look === 'sticker') {
    const s = STICKER;
    const edge = `stroke-width="${s.border + dot}" stroke-linejoin="round" stroke-linecap="round" d="${silhouette}"`;
    art += `<path transform="translate(${s.shadow} ${s.shadow})" fill="#000" stroke="#000" opacity=".22" ${edge}/>`;
    art += `<path fill="#fff" stroke="#fff" ${edge}/>`;
  }
  if (look === 'inked' || look === 'soft-inked') {
    art += `<path fill="${ink}" stroke="${ink}" stroke-width="${INK + dot}" stroke-linejoin="round" stroke-linecap="round" d="${silhouette}"/>`;
  }
  art += isDot ? `<g stroke-width="1" stroke-linecap="round">${fills}</g>` : fills;
  if (look === 'inked' && shape === 'square') {
    art += `<path fill="none" stroke="${ink}" stroke-width="${INNER_INK}" stroke-linecap="square" d="${innerEdges(g)}"/>`;
  }
  const n = c.cells.length;
  if (look === 'sticker') {
    const e = (n / 2) * (1 - STICKER.scale);
    art = `<g transform="matrix(${STICKER.scale} 0 0 ${STICKER.scale} ${e} ${e})">${art}</g>`;
  }
  const pad = padding(shape);
  const span = n + 2 * pad;
  const body = framed(frame, frameFit(frame, shape, n, pad), n, pad, p.bg, art);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${span} ${span}" width="${size}" height="${size}" role="img" aria-label="${kind.name}, ${look}">${body}</svg>`;
}
