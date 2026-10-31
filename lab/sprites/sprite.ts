import type { Settled } from '../../src/core/options.js';
import { createRng } from '../../src/core/random.js';
import { stillSvg } from '../../src/core/render/svg.js';
import { type Look, type Palette, Role } from '../../src/core/types.js';
import { type Draw, FULL } from './full.js';
import { SMALL } from './small.js';

export type Element = 'fire' | 'water' | 'earth' | 'wind' | 'space';
type Form = keyof typeof FULL;

const p = (name: string, ...c: [string, string, string, string, string, string, string]): Palette => {
  const [bg, grid, body, shade, screen, glow, accent] = c;
  return { name, bg, grid, body, shade, screen, glow, accent };
};

/** Each element: its two forms and three palettes. Screen is the bright core, accent the motes. */
export const ELEMENTS: Readonly<Record<Element, { forms: [Form, Form]; palettes: Palette[] }>> = {
  fire: {
    forms: ['flame', 'wisp'],
    palettes: [
      p('Ember', '#1d1210', '#2c1c18', '#ff7a2f', '#d9461f', '#ffd25e', '#2a0f05', '#ffb347'),
      p('Gas', '#0e1424', '#18213a', '#4f8cff', '#2f5fd6', '#bfe3ff', '#0b1430', '#8fd0ff'),
      p('Spark', '#1a0f1f', '#281830', '#ff4fa3', '#c92d7a', '#ffd0e8', '#2a0618', '#ffb3dc'),
    ],
  },
  water: {
    forms: ['drop', 'bubble'],
    palettes: [
      p('Lagoon', '#0f1b26', '#182a3a', '#3fa9f5', '#2177c4', '#d7f0ff', '#0b1a2c', '#8fd3ff'),
      p('Sea glass', '#eaf6f3', '#d8ece7', '#3fc1b0', '#239184', '#e6fffb', '#0d2a26', '#239184'),
      p('Ink', '#f2f0fa', '#e2def2', '#5b6cf0', '#3b48c4', '#dfe3ff', '#11143a', '#9aa5ff'),
    ],
  },
  earth: {
    forms: ['boulder', 'crystal'],
    palettes: [
      p('Clay', '#f4ede4', '#e7dccd', '#b07b4f', '#855630', '#f3dcbc', '#2a170a', '#4f9e33'),
      p('Stone', '#1a1c1a', '#272a27', '#8d958c', '#646b63', '#e4e9e2', '#121412', '#7ed957'),
      p('Amethyst', '#17121f', '#241c30', '#a77bf0', '#7550c4', '#efe3ff', '#1a0f2e', '#ffd166'),
    ],
  },
  wind: {
    forms: ['puff', 'tornado'],
    palettes: [
      p('Breeze', '#dcecf7', '#cbe0ef', '#ffffff', '#a9c6dd', '#ffffff', '#2b3f55', '#6fa9d6'),
      p('Storm', '#1b2030', '#262d42', '#c9d3e6', '#8f9bb5', '#eef2fa', '#151a28', '#ffe066'),
      p('Gust', '#102320', '#1a332f', '#b8f2df', '#79c9ae', '#e9fff7', '#0b1f1a', '#5fe0b5'),
    ],
  },
  space: {
    forms: ['planet', 'star'],
    palettes: [
      p('Nebula', '#0d0b1f', '#1a1733', '#7b5cff', '#5236d1', '#fff3b0', '#0d0b1f', '#ff8fd1'),
      p('Void', '#05070f', '#121626', '#4f63a8', '#33437a', '#ffffff', '#e9ecff', '#ffd166'),
      p('Saturn', '#14101e', '#221b31', '#f2b56b', '#c9853b', '#fff1c9', '#2a1806', '#c3a6ff'),
    ],
  },
};

/** What a seed picks for a sprite. */
export interface SpriteTraits {
  element: Element;
  form: Form;
  palette: Palette;
  /** Milliseconds each of the four frames holds. */
  beats: number[];
}

/** Picks a sprite's traits. Seeds are salted, so a sprite doesn't echo its robot. */
export function spriteTraits(seed: string, element?: Element): SpriteTraits {
  const rng = createRng(`sprite:${seed}`);
  const all = Object.keys(ELEMENTS) as Element[];
  const el = element ?? (all[Math.floor(rng() * all.length)] as Element);
  const e = ELEMENTS[el];
  const form = e.forms[Math.floor(rng() * 2)] as Form;
  const palette = e.palettes[Math.floor(rng() * e.palettes.length)] as Palette;
  const base = 150 + Math.floor(rng() * 90);
  const beats = [0, 1, 2, 3].map(() => base + Math.floor(rng() * 80));
  return { element: el, form, palette, beats };
}

/** Options for {@link sprite}. */
export interface SpriteOptions {
  size?: number;
  look?: Look;
  eyes?: boolean;
  animate?: boolean;
  /** Pin the element instead of letting the seed pick. */
  element?: Element;
  /** Draw the full grid even when small. */
  full?: boolean;
}

const inner = (svg: string): string => svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');

/**
 * Draws a sprite: four frames swapped with SMIL, so a flame sways, a drop
 * wobbles and the motes around it drift. The sprite itself never dims.
 */
export function sprite(seed: string, o: SpriteOptions = {}): string {
  const t = spriteTraits(seed, o.element);
  const size = o.size ?? 96;
  const isSmall = size < 40 && !o.full;
  const look = o.look ?? 'gapped';
  const draw: Draw = (isSmall ? SMALL : FULL)[t.form];
  const s: Settled = { size, isSmall, showGrid: false, frame: 'rounded', look, animate: false };
  const pic = (f: number, background: boolean) => ({
    cells: background ? draw(0, false).cells.map((r) => r.map(() => Role.Empty)) : draw(f, o.eyes ?? true).cells,
    shape: 'square' as const,
    palette: t.palette,
    background,
    title: null,
  });
  const showGrid = !isSmall && look === 'gapped';
  const base = stillSvg(pic(0, true), { ...s, showGrid });
  const open = base.match(/^<svg[^>]*>/)?.[0] ?? '<svg>';
  if (!o.animate) return base.replace('</svg>', `${inner(stillSvg(pic(0, false), s))}</svg>`);
  const total = t.beats.reduce((a, b) => a + b, 0);
  let at = 0;
  const times = t.beats.map((b) => {
    const k = at / total;
    at += b;
    return Math.round(k * 1000) / 1000;
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
