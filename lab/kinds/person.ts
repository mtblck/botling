import { createRng, int, maybePick, pick } from '../../src/core/random.js';
import type { Palette, Shape } from '../../src/core/types.js';
import { blob, type Canvas, createCanvas, type Kind, Role } from './art.js';
import { HAIR, OUTFITS, SKIN } from './palettes.js';
import { drawHair, HAIRS, TOP } from './person-hair.js';

const EYES = ['dot', 'tall', 'happy', 'wink', 'closed'] as const;
const MOUTHS = ['smile', 'line', 'open', 'smirk'] as const;
const FACIAL = ['none', 'mustache', 'beard'] as const;
const EYEWEAR = ['none', 'glasses', 'shades'] as const;
const HATS = ['none', 'beanie', 'earring', 'headband'] as const;

export interface PersonTraits {
  outfit: number;
  skin: number;
  hairColour: number;
  hair: (typeof HAIRS)[number];
  eyes: (typeof EYES)[number];
  mouth: (typeof MOUTHS)[number];
  facial: (typeof FACIAL)[number];
  eyewear: (typeof EYEWEAR)[number];
  hat: (typeof HATS)[number];
  halfWidth: number;
  hasBrows: boolean;
  hasCheeks: boolean;
  shape: Shape;
}

/** Relative luminance of a #rrggbb colour. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = Number.parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const contrast = (a: string, b: string): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
};

/** The seed's hair colour, or the next one along that stands out from the skin. */
function hairFor(skin: number, pick: number): number {
  const body = (SKIN[skin] as (typeof SKIN)[number]).body;
  for (let i = 0; i < HAIR.length; i++) {
    const h = (pick + i) % HAIR.length;
    if (contrast(HAIR[h] as string, body) >= 1.8) return h;
  }
  return pick;
}

function traits(seed: string): PersonTraits {
  const rng = createRng(`person:${seed}`);
  const skin = Math.floor(rng() * SKIN.length);
  return {
    outfit: Math.floor(rng() * OUTFITS.length),
    skin,
    hairColour: hairFor(skin, Math.floor(rng() * HAIR.length)),
    hair: pick(rng, HAIRS),
    eyes: pick(rng, EYES),
    mouth: pick(rng, MOUTHS),
    facial: maybePick(rng, 0.25, FACIAL),
    eyewear: maybePick(rng, 0.25, EYEWEAR),
    hat: maybePick(rng, 0.25, HATS),
    halfWidth: int(rng, 3, 4),
    hasBrows: rng() < 0.4,
    hasCheeks: rng() < 0.35,
    shape: rng() < 0.7 ? 'square' : 'circle',
  };
}

const EYE_ROW = 6;
const EYE_X = 2;

function draw(t: PersonTraits): Canvas {
  const c = createCanvas();
  const hw = t.halfWidth;
  // Shoulders, neck, then the head over them.
  blob(c, 12, [hw + 1, hw + 3, hw + 3], Role.Screen);
  c.paint(c.center, 12, Role.Body);
  blob(c, 11, [1], Role.Body);
  blob(c, TOP, [hw - 1, hw, hw, hw, hw, hw, hw - 1, hw - 2], Role.Body);
  c.mirror(hw + 1, EYE_ROW, Role.Body);
  c.mirror(hw + 1, EYE_ROW + 1, Role.Body);
  drawHair(c, t.hair, hw);
  const mouthRow = t.facial === 'mustache' ? 9 : 8;
  if (t.facial === 'beard') {
    blob(c, 8, [hw, hw - 1, hw - 2], Role.Shade);
    c.mirror(hw, 7, Role.Shade);
  }
  if (t.facial === 'mustache') blob(c, 8, [1], Role.Shade);
  eyes(c, t);
  if (t.hasBrows && t.eyewear !== 'shades') {
    c.mirror(EYE_X, EYE_ROW - 1, Role.Shade);
    c.mirror(EYE_X + 1, EYE_ROW - 1, Role.Shade);
  }
  mouth(c, t, mouthRow, t.facial === 'beard' ? Role.Body : Role.Glow);
  if (t.hasCheeks && t.facial !== 'beard') c.mirror(EYE_X + 1, EYE_ROW + 1, Role.Accent);
  eyewear(c, t);
  hat(c, t, hw);
  return c;
}

function eyes(c: Canvas, t: PersonTraits): void {
  const e = (dx: number, y: number): void => c.mirror(dx, y, Role.Glow);
  const x = EYE_X;
  switch (t.eyes) {
    case 'dot':
      e(x, EYE_ROW);
      return;
    case 'tall':
      e(x, EYE_ROW);
      e(x, EYE_ROW + 1);
      return;
    case 'happy':
      e(x, EYE_ROW);
      e(x + 1, EYE_ROW + 1);
      e(x - 1, EYE_ROW + 1);
      return;
    case 'wink':
      c.paint(c.center - x, EYE_ROW, Role.Glow);
      c.paint(c.center + x, EYE_ROW + 1, Role.Glow);
      c.paint(c.center + x + 1, EYE_ROW + 1, Role.Glow);
      return;
    case 'closed':
      e(x, EYE_ROW + 1);
      e(x + 1, EYE_ROW + 1);
      return;
  }
}

function mouth(c: Canvas, t: PersonTraits, y: number, role: Role): void {
  switch (t.mouth) {
    case 'smile':
      c.mirror(0, y, role);
      c.mirror(1, y, role);
      c.mirror(2, y - 1, role);
      return;
    case 'line':
      c.mirror(0, y, role);
      c.mirror(1, y, role);
      return;
    case 'open':
      c.mirror(0, y, role);
      c.paint(c.center, y + 1, Role.Accent);
      return;
    case 'smirk':
      c.mirror(0, y, role);
      c.paint(c.center + 1, y, role);
      c.paint(c.center + 2, y - 1, role);
      return;
  }
}

function eyewear(c: Canvas, t: PersonTraits): void {
  if (t.eyewear === 'shades') {
    for (let dx = 0; dx <= EYE_X + 1; dx++) c.mirror(dx, EYE_ROW, Role.Glow);
    c.mirror(EYE_X, EYE_ROW + 1, Role.Glow);
    c.mirror(EYE_X - 1, EYE_ROW + 1, Role.Glow);
  } else if (t.eyewear === 'glasses') {
    for (const dx of [0, EYE_X - 1, EYE_X + 1]) c.mirror(dx, EYE_ROW, Role.Accent);
    for (const dx of [EYE_X - 1, EYE_X, EYE_X + 1]) c.mirror(dx, EYE_ROW - 1, Role.Accent);
  }
}

function hat(c: Canvas, t: PersonTraits, hw: number): void {
  if (t.hat === 'beanie') {
    blob(c, TOP - 3, [hw - 2, hw - 1, hw, hw + 1], Role.Accent);
    c.paint(c.center, TOP - 4, Role.Accent);
  } else if (t.hat === 'headband') {
    for (let dx = 0; dx <= hw + 1; dx++) c.mirror(dx, TOP + 1, Role.Accent);
  } else if (t.hat === 'earring') {
    c.paint(c.center + hw + 1, EYE_ROW + 2, Role.Accent);
  }
}

/** People: skin tones, hair, faces, glasses and hats over a shirt. */
export const person: Kind<PersonTraits> = {
  name: 'Person',
  traits,
  draw,
  palette: (t): Palette => {
    const o = OUTFITS[t.outfit] as (typeof OUTFITS)[number];
    const s = SKIN[t.skin] as (typeof SKIN)[number];
    return { ...o, body: s.body, glow: s.glow, shade: HAIR[t.hairColour] as string };
  },
  shape: (t) => t.shape,
  describe: (t) => [t.hair, t.eyes, t.mouth, t.facial, t.eyewear, t.hat].filter((s) => s !== 'none').join(' · '),
};
