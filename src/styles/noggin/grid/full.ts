import { blob } from '../../../core/art.js';
import { type Canvas, createCanvas, keepTags, tagged } from '../../../core/canvas.js';
import { type NogginTraits, Role } from '../types.js';
import { drawHair, TOP } from './hair.js';

const EYE_ROW = 6;
const EYE_X = 2;

/**
 * Draws the detailed 15x15 Noggin.
 *
 * @param t - The Noggin's traits
 * @returns A 15x15 canvas
 */
export function drawGrid(t: NogginTraits): Canvas {
  const c = createCanvas();
  const hw = t.halfWidth;
  // Shoulders, neck, then the head over them.
  blob(c, 12, [hw + 1, hw + 3, hw + 3], Role.Screen);
  c.paint(c.center, 12, Role.Body);
  blob(c, 11, [1], Role.Body);
  blob(c, TOP, [hw - 1, hw, hw, hw, hw, hw, hw - 1, hw - 2], Role.Body);
  c.mirror(hw + 1, EYE_ROW, Role.Body);
  c.mirror(hw + 1, EYE_ROW + 1, Role.Body);
  if (t.headwear !== 'headscarf') drawHair(c, t.hair, hw);
  const mouthRow = t.facial === 'mustache' ? 9 : 8;
  if (t.facial === 'beard') {
    blob(c, 8, [hw, hw - 1, hw - 2], Role.Shade);
    c.mirror(hw, 7, Role.Shade);
  }
  if (t.facial === 'mustache') blob(c, 8, [1], Role.Shade);
  // Tagged parts move when animated: eyes blink and the mouth talks.
  tagged(c, 'eyes', () => eyes(c, t));
  if (t.hasBrows && t.eyewear !== 'shades') {
    c.mirror(EYE_X, EYE_ROW - 1, Role.Shade);
    c.mirror(EYE_X + 1, EYE_ROW - 1, Role.Shade);
  }
  // A smile or smirk corner can land on an eye; that cell stays with the eye.
  keepTags(c, 'eyes', () =>
    tagged(c, 'mouth', () => mouth(c, t, mouthRow, t.facial === 'beard' ? Role.Body : Role.Glow)),
  );
  if (t.hasCheeks && t.facial !== 'beard') c.mirror(EYE_X + 1, EYE_ROW + 1, Role.Accent);
  eyewear(c, t);
  headwear(c, t, hw);
  return c;
}

function eyes(c: Canvas, t: NogginTraits): void {
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

function mouth(c: Canvas, t: NogginTraits, y: number, role: Role): void {
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

function eyewear(c: Canvas, t: NogginTraits): void {
  if (t.eyewear === 'shades') {
    for (let dx = 0; dx <= EYE_X + 1; dx++) c.mirror(dx, EYE_ROW, Role.Glow);
    c.mirror(EYE_X, EYE_ROW + 1, Role.Glow);
    c.mirror(EYE_X - 1, EYE_ROW + 1, Role.Glow);
  } else if (t.eyewear === 'glasses') {
    for (const dx of [0, EYE_X - 1, EYE_X + 1]) c.mirror(dx, EYE_ROW, Role.Accent);
    for (const dx of [EYE_X - 1, EYE_X, EYE_X + 1]) c.mirror(dx, EYE_ROW - 1, Role.Accent);
  }
}

function headwear(c: Canvas, t: NogginTraits, hw: number): void {
  if (t.headwear === 'beanie') {
    blob(c, TOP - 3, [hw - 2, hw - 1, hw, hw + 1], Role.Accent);
    c.paint(c.center, TOP - 4, Role.Accent);
  } else if (t.headwear === 'headband') {
    for (let dx = 0; dx <= hw + 1; dx++) c.mirror(dx, TOP + 1, Role.Accent);
  } else if (t.headwear === 'earring') {
    c.paint(c.center + hw + 1, EYE_ROW + 2, Role.Accent);
  } else if (t.headwear === 'headscarf') {
    // Covers the hair and frames the face down to the shoulders.
    blob(c, TOP - 2, [hw - 1, hw + 1, hw + 1], Role.Accent);
    for (let y = TOP + 1; y <= 11; y++) c.mirror(hw + 1, y, Role.Accent);
    c.mirror(hw, TOP + 6, Role.Accent);
    for (const dx of [hw - 1, hw]) c.mirror(dx, TOP + 7, Role.Accent);
    for (let dx = 2; dx <= hw; dx++) c.mirror(dx, TOP + 8, Role.Accent);
  }
}
