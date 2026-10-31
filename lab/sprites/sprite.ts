import type { Settled } from '../../src/core/options.js';
import { createRng, type Rng } from '../../src/core/random.js';
import { stillSvg } from '../../src/core/render/svg.js';
import { type Frame, type Look, type Palette, Role } from '../../src/core/types.js';
import { EYES, type Face, MOUTHS, paintFace } from './face.js';
import { FORMS, type FormName } from './forms/index.js';
import { ELEMENTS, type Element } from './palettes.js';

export { ELEMENTS, type Element };

/** What a seed picks for a sprite. */
export interface SpriteTraits {
  element: Element;
  form: FormName;
  palette: Palette;
  face: Face;
  /** Milliseconds each of the four frames holds. */
  beats: number[];
}

const choose = <T>(rng: Rng, list: readonly T[]): T => list[Math.floor(rng() * list.length)] as T;

/** Picks a sprite's traits. Seeds are salted, so a sprite doesn't echo its robot. */
export function spriteTraits(seed: string, element?: Element): SpriteTraits {
  // The salt goes after the seed, so seeds that differ only in their last character
  // (user-1, user-2) still hash far apart.
  const rng = createRng(`${seed}:sprite`);
  const el = element ?? choose(rng, Object.keys(ELEMENTS) as Element[]);
  const e = ELEMENTS[el];
  const form = choose(rng, e.forms);
  const palette = choose(
    rng,
    e.palettes.filter((p) => !p.only || p.only === form),
  ).palette;
  const face: Face = { eyes: choose(rng, EYES), mouth: choose(rng, MOUTHS), blush: rng() < 0.3 };
  const base = 150 + Math.floor(rng() * 90);
  const beats = [0, 1, 2, 3].map(() => base + Math.floor(rng() * 80));
  return { element: el, form, palette, face, beats };
}

/** Options for {@link sprite}. */
export interface SpriteOptions {
  size?: number;
  look?: Look;
  frame?: Frame;
  /** Draw the face; false draws the sprite faceless, for comparison. */
  face?: boolean;
  animate?: boolean;
  /** Pin the element instead of letting the seed pick. */
  element?: Element;
}

const inner = (svg: string): string => svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');

/** The cells of frame `f`, face and all. */
export function spriteCells(t: SpriteTraits, f: number, small: boolean, face = true): Role[][] {
  const { c, at } = (small ? FORMS[t.form].small : FORMS[t.form].full)(f);
  if (face) paintFace(c, at, t.face, small);
  return c.cells;
}

/**
 * Draws a sprite. Animated, its four frames swap with SMIL, so a flame sways,
 * a drop wobbles and the motes around it drift.
 */
export function sprite(seed: string, o: SpriteOptions = {}): string {
  const t = spriteTraits(seed, o.element);
  const size = o.size ?? 96;
  const isSmall = size < 40;
  const look = o.look ?? 'gapped';
  const s: Settled = { size, isSmall, showGrid: false, frame: o.frame ?? 'square', look, animate: false };
  const pic = (f: number, background: boolean) => {
    const cells = spriteCells(t, f, isSmall, o.face ?? true);
    return {
      cells: background ? cells.map((r) => r.map(() => Role.Empty)) : cells,
      shape: 'square' as const,
      palette: t.palette,
      background,
      title: null,
    };
  };
  const base = stillSvg(pic(0, true), { ...s, showGrid: !isSmall && look === 'gapped' });
  if (!o.animate) return base.replace('</svg>', `${inner(stillSvg(pic(0, false), s))}</svg>`);
  const open = base.match(/^<svg[^>]*>/)?.[0] ?? '<svg>';
  const total = t.beats.reduce((a, b) => a + b, 0);
  let at = 0;
  const times = t.beats.map((b) => {
    const k = Math.round((at / total) * 1000) / 1000;
    at += b;
    return k;
  });
  const frames = [0, 1, 2, 3]
    .map((f) => {
      const values = [0, 1, 2, 3].map((i) => (i === f ? 'visible' : 'hidden')).join(';');
      const anim = `<animate attributeName="visibility" values="${values}" keyTimes="${times.join(';')}" dur="${total}ms" calcMode="discrete" repeatCount="indefinite"/>`;
      return `<g visibility="${f === 0 ? 'visible' : 'hidden'}">${anim}${inner(stillSvg(pic(f, false), s))}</g>`;
    })
    .join('');
  return `${open}${inner(base)}${frames}</svg>`;
}
