import type { Settled } from '../../core/options.js';
import { stillSvg } from '../../core/render/svg.js';
import { type Palette, Role, type Shape } from '../../core/types.js';
import { drawFrame, FRAME_COUNT } from './grid/index.js';
import type { SpriteTraits } from './types.js';

/** The picture a frame draws. */
interface Dress {
  palette: Palette;
  shape: Shape;
  background: boolean;
  title: string | null;
}

const inner = (svg: string): string => svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');

/**
 * Where each frame starts and ends, in whole percent of one loop. The last
 * frame always ends at 100.
 */
function windows(beats: readonly number[]): [number, number][] {
  const total = beats.reduce((a, b) => a + b, 0);
  let at = 0;
  const starts = beats.map((b) => {
    const k = Math.round((at / total) * 100);
    at += b;
    return k;
  });
  return starts.map((a, i) => [a, starts[i + 1] ?? 100]);
}

/**
 * One frame's rule: shown from `a`% to `b`% of the loop and hidden the rest.
 * The keyframes are named for the window and the class for the window and
 * loop length, so a name means the same rule in every Sprite on a page.
 */
function rule(a: number, b: number, total: number): string {
  const name = `sprite-f${a}t${b}`;
  const show = a === 0 ? `0%{visibility:visible}` : `0%{visibility:hidden}${a}%{visibility:visible}`;
  const hide = b === 100 ? '' : `${b}%{visibility:hidden}`;
  return `.${name}-${total}{animation:${name} ${total / 1000}s 0s steps(1,end) infinite}@keyframes ${name}{${show}${hide}}`;
}

/**
 * Draws a moving Sprite: the background once, then its four frames, each
 * shown in turn by a CSS animation inside a reduced-motion query. At rest,
 * and for anyone who prefers reduced motion, only the first frame shows,
 * which is the still Sprite.
 *
 * @param t - The Sprite's traits
 * @param look - Palette, cell shape, background and title
 * @param s - Settled options
 * @returns A standalone SVG document
 */
export function animatedSprite(t: SpriteTraits, look: Dress, s: Settled): string {
  const blank = drawFrame(t, 0, s.isSmall).cells.map((row) => row.map(() => Role.Empty));
  const base = stillSvg({ ...look, cells: blank }, s);
  const total = t.beats.reduce((a, b) => a + b, 0);
  const plain = { ...s, showGrid: false };
  let css = '';
  let frames = '';
  windows(t.beats)
    .slice(0, FRAME_COUNT)
    .forEach(([a, b], f) => {
      const cells = drawFrame(t, f, s.isSmall).cells;
      const svg = stillSvg({ ...look, cells, background: false, title: null }, plain);
      const hidden = f === 0 ? '' : ' visibility="hidden"';
      frames += `<g class="sprite-f${a}t${b}-${total}"${hidden}>${inner(svg)}</g>`;
      css += rule(a, b, total);
    });
  // Written the way the other styles write theirs, so the playground's GIF export can pause it.
  const style = `<style>@media (prefers-reduced-motion:no-preference){${css}}</style>`;
  return base.replace(/^(<svg[^>]*>)/, `$1${style}`).replace(/<\/svg>$/, `${frames}</svg>`);
}
