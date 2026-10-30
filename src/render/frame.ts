import type { Frame, Shape } from '../types.js';
import { edge } from './cell.js';

/** Every frame, the default first. A seed never picks one. */
export const FRAMES: readonly Frame[] = Object.freeze(['square', 'rounded', 'squircle', 'circle']);

/** A rounded frame's corner radius, as a fraction of its width. */
const ROUNDED_RADIUS = 0.2;
/**
 * How far from a squircle's corner, as a fraction of its width, its corner
 * curve keeps its handles. Smaller is squarer.
 */
const SQUIRCLE_HANDLE = 0.08;
/**
 * The robot's scale in a squircle. Wide shoulders reach into the corners a
 * squircle cuts, so the robot draws a little smaller to fit; the frame tests
 * check every robot in the corpus fits, hovering included.
 */
const SQUIRCLE_SCALE = 0.92;
/** Slack for rounding when a point sits on a frame's edge. */
const EPSILON = 1e-9;
/** Segments per quarter when testing points against the squircle's curve. */
const SQUIRCLE_STEPS = 16;

/**
 * A quarter of the squircle in a frame of half-width 1 centred on 0,0, from
 * (0, 1) round to (1, 0). The chords lie inside the curve, so a point inside
 * them is inside the squircle.
 */
const QUARTER: readonly (readonly [number, number])[] = Array.from({ length: SQUIRCLE_STEPS + 1 }, (_, i) => {
  const t = i / SQUIRCLE_STEPS;
  const s = 1 - t;
  const k = 1 - 2 * SQUIRCLE_HANDLE;
  // Cubic from (0, 1) with handles (k, 1) and (1, k) to (1, 0).
  return [3 * s * t * t + 3 * s * s * t * k + t ** 3, s ** 3 + 3 * s * s * t + 3 * s * t * t * k] as const;
});

/**
 * Whether a point lies inside a frame.
 *
 * @param frame - Frame shape
 * @param u - Across, from -1 (left edge) to 1 (right edge)
 * @param v - Down, from -1 (top edge) to 1 (bottom edge)
 * @returns True inside or on the edge
 */
export function contains(frame: Frame, u: number, v: number): boolean {
  const a = Math.abs(u);
  const b = Math.abs(v);
  if (a > 1 + EPSILON || b > 1 + EPSILON) return false;
  if (frame === 'circle') return a * a + b * b <= 1 + EPSILON;
  if (frame === 'rounded') {
    const r = 2 * ROUNDED_RADIUS;
    const dx = Math.max(0, a - 1 + r);
    const dy = Math.max(0, b - 1 + r);
    return dx * dx + dy * dy <= r * r + EPSILON;
  }
  if (frame === 'squircle') {
    for (let i = 1; i < QUARTER.length; i++) {
      const [px, py] = QUARTER[i - 1] as readonly [number, number];
      const [qx, qy] = QUARTER[i] as readonly [number, number];
      if ((qx - px) * (b - py) - (qy - py) * (a - px) > EPSILON) return false;
    }
  }
  return true;
}

/** How a robot sits in its frame. */
export interface Fit {
  /** The robot's scale about its centre. */
  scale: number;
  /** Grid cells to try beyond each side of the grid, where a shrunk robot leaves room. */
  reach: number;
  /** Whether an empty grid cell fits wholly inside the frame, so it's drawn. */
  holds: (x: number, y: number) => boolean;
}

const SQUARE_FIT: Fit = { scale: 1, reach: 0, holds: () => true };
const fits = new Map<string, Fit>();

/**
 * How a robot sits in a frame: its scale, and which grid cells to draw. The
 * grid keeps only whole cells, so its edge follows the frame in steps.
 *
 * @param frame - Frame shape
 * @param shape - Cell shape
 * @param n - Grid size, in cells
 * @param pad - Padding around the grid, in cells
 * @returns The robot's scale and a test for grid cells
 */
export function frameFit(frame: Frame, shape: Shape, n: number, pad: number): Fit {
  if (frame === 'square') return SQUARE_FIT;
  const key = `${frame} ${shape} ${n}`;
  const known = fits.get(key);
  if (known) return known;
  const scale = frame === 'squircle' ? SQUIRCLE_SCALE : 1;
  const half = n / 2 + pad;
  const reach = Math.ceil(half / scale - n / 2);
  const span = n + 2 * reach;
  const mask = new Uint8Array(span * span);
  const at = (milli: number): number => ((milli / 1000 - n / 2) * scale) / half;
  for (let y = -reach; y < n + reach; y++) {
    for (let x = -reach; x < n + reach; x++) {
      const inside = edge(shape, x, y).every(([px, py]) => contains(frame, at(px), at(py)));
      mask[(y + reach) * span + x + reach] = inside ? 1 : 0;
    }
  }
  const isIn = (i: number): boolean => i >= -reach && i < n + reach;
  const holds = (x: number, y: number): boolean => isIn(x) && isIn(y) && mask[(y + reach) * span + x + reach] === 1;
  const fit: Fit = { scale, reach, holds };
  fits.set(key, fit);
  return fit;
}

const fmt = (n: number): string => String(Math.round(n * 1000) / 1000);

/** The frame's outline as an element still open for its paint, in viewBox units. */
function outlineTag(frame: Frame, lo: number, span: number): string {
  const c = fmt(lo + span / 2);
  if (frame === 'circle') return `<circle cx="${c}" cy="${c}" r="${fmt(span / 2)}"`;
  if (frame === 'squircle') {
    const p = (fx: number, fy: number): string => `${fmt(lo + fx * span)} ${fmt(lo + fy * span)}`;
    const h = SQUIRCLE_HANDLE;
    const k = 1 - h;
    return `<path d="M${p(0.5, 0)}C${p(h, 0)} ${p(0, h)} ${p(0, 0.5)}S${p(h, 1)} ${p(0.5, 1)}S${p(1, k)} ${p(1, 0.5)}S${p(k, 0)} ${p(0.5, 0)}z"`;
  }
  const rect = `<rect x="${fmt(lo)}" y="${fmt(lo)}" width="${fmt(span)}" height="${fmt(span)}"`;
  return frame === 'rounded' ? `${rect} rx="${fmt(span * ROUNDED_RADIUS)}"` : rect;
}

/**
 * The background and cells inside their frame. A square frame is today's
 * plain square. Any other is clipped to its outline, so nothing pokes out of
 * a circle; the clip path's id names its geometry, so robots inlined on one
 * page can share it without clashing.
 *
 * @param frame - Frame shape
 * @param fit - The robot's fit, from {@link frameFit}
 * @param n - Grid size, in cells
 * @param pad - Padding around the grid, in cells
 * @param bg - Background colour, or null for none
 * @param cells - The grid and robot markup
 * @returns Markup for inside the `<svg>`
 */
export function framed(frame: Frame, fit: Fit, n: number, pad: number, bg: string | null, cells: string): string {
  const span = n + 2 * pad;
  const tag = outlineTag(frame, -pad, span);
  const back = bg === null ? '' : `${tag} fill="${bg}"/>`;
  if (frame === 'square') return back + cells;
  let inner = cells;
  if (inner && fit.scale !== 1) {
    const e = fmt((n / 2) * (1 - fit.scale));
    inner = `<g transform="matrix(${fit.scale} 0 0 ${fit.scale} ${e} ${e})">${inner}</g>`;
  }
  const id = `botling-${frame}-${Math.round(pad * 1000)}-${Math.round(span * 1000)}`;
  const clipped = inner ? `<g clip-path="url(#${id})">${inner}</g>` : '';
  return `<clipPath id="${id}">${tag}/></clipPath>${back}${clipped}`;
}
