import type { Canvas } from '../../../core/canvas.js';
import { type Hair, Role } from '../types.js';

/** The detailed head's top row. */
export const TOP = 3;

/**
 * Draws a hairstyle in the shade role, around a head whose top row is {@link TOP}.
 *
 * @param c - Canvas to draw on
 * @param style - The hairstyle
 * @param hw - Head half-width
 */
export function drawHair(c: Canvas, style: Hair, hw: number): void {
  const h = (dx: number, y: number): void => c.mirror(dx, y, Role.Shade);
  const row = (y: number, from: number, to: number): void => {
    for (let dx = from; dx <= to; dx++) h(dx, y);
  };
  const short = (): void => {
    row(TOP - 1, 0, hw - 1);
    row(TOP, 0, hw);
    h(hw, TOP + 1);
  };
  switch (style) {
    case 'bald':
      return;
    case 'buzz':
      row(TOP, 0, hw - 1);
      return;
    case 'short':
      short();
      return;
    case 'spiky':
      short();
      for (let dx = 0; dx < hw; dx += 2) h(dx, TOP - 2);
      return;
    case 'bob':
    case 'long': {
      row(TOP - 1, 0, hw - 1);
      row(TOP, 0, hw + 1);
      row(TOP + 1, 0, hw + 1);
      const end = style === 'long' ? 13 : 9;
      for (let y = TOP + 2; y <= end; y++) row(y, hw + 1, y > 10 ? hw + 2 : hw + 1);
      return;
    }
    case 'bun':
      short();
      row(TOP - 2, 0, 1);
      h(0, TOP - 3);
      return;
    case 'mohawk':
      for (let y = TOP - 3; y <= TOP; y++) h(0, y);
      h(1, TOP - 1);
      h(1, TOP);
      return;
    case 'curly':
      row(TOP - 2, 0, hw - 1);
      row(TOP - 1, 0, hw + 1);
      row(TOP, 0, hw + 2);
      row(TOP + 1, hw - 1, hw + 2);
      for (let y = TOP + 2; y <= TOP + 5; y++) row(y, hw + 1, hw + 2);
      return;
    case 'sidepart':
      short();
      for (let dx = 1; dx <= hw; dx++) c.paint(c.center - dx, TOP + 1, Role.Shade);
      return;
    case 'afro':
      row(TOP - 3, 0, hw - 1);
      row(TOP - 2, 0, hw + 1);
      row(TOP - 1, 0, hw + 2);
      row(TOP, 0, hw + 2);
      row(TOP + 1, hw, hw + 2);
      row(TOP + 2, hw + 1, hw + 2);
      row(TOP + 3, hw + 1, hw + 2);
      h(hw + 1, TOP + 4);
      return;
    case 'locs':
      short();
      for (let y = TOP; y <= 11; y++) h(hw + 1, y);
      for (let y = TOP + 1; y <= 12; y += 2) h(hw + 2, y);
      return;
  }
}
