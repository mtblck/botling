import { type Canvas, CENTER } from '../../../core/canvas.js';
import { Role, type Traits } from '../types.js';
import { antennaTip } from './extras.js';
import type { Layout } from './layout.js';
import { slots } from './slots.js';

/** Paints a cell only where the head's body shows, so markings never cover the face or an edge. */
function onBody(c: Canvas, x: number, y: number, role: Role): void {
  if (c.cells[y]?.[x] === Role.Body) c.paint(x, y, role);
}

/**
 * Draws markings on the head: a forehead stripe, corner rivets or a chin panel.
 *
 * @param c - Canvas to draw on
 * @param t - The robot's traits
 * @param l - Shared layout
 */
export function drawPattern(c: Canvas, t: Traits, l: Layout): void {
  const hw = t.halfWidth;
  const both = (dx: number, y: number, role: Role): void => {
    onBody(c, CENTER - dx, y, role);
    onBody(c, CENTER + dx, y, role);
  };
  switch (t.pattern) {
    case 'stripe':
      for (let dx = 0; dx < hw; dx++) both(dx, l.top + 1, Role.Shade);
      break;
    case 'rivets':
      both(hw - 1, l.top + 1, Role.Accent);
      both(hw - 1, l.bottom - 1, Role.Accent);
      break;
    case 'chin':
      for (let dx = 1; dx < hw; dx++) both(dx, l.bottom, Role.Shade);
      both(0, l.bottom, Role.Accent);
      break;
    case 'none':
      break;
  }
}

/**
 * Draws the light in the middle of the chest, when there are shoulders to put it on.
 *
 * @param c - Canvas to draw on
 * @param t - The robot's traits
 */
export function drawChestLight(c: Canvas, t: Traits): void {
  if (!t.hasShoulders || !t.hasChestLight) return;
  c.mirror(0, 14, Role.Glow);
  c.mirror(1, 14, Role.Shade);
}

/**
 * Draws the one-sided quirk: an ear on the left, a dent in the top right
 * corner, a patch low on the left or an antenna off to the right.
 *
 * @param c - Canvas to draw on
 * @param t - The robot's traits
 * @param l - Shared layout
 */
export function drawQuirk(c: Canvas, t: Traits, l: Layout): void {
  if (!slots(t).hasQuirk) return;
  const hw = t.halfWidth;
  switch (t.quirk) {
    case 'ear': {
      const x = CENTER - hw - (t.head === 'tv' ? 2 : 1);
      for (let dy = 0; dy <= 2; dy++) c.paint(x, l.eyeRow + dy, Role.Shade);
      break;
    }
    case 'dent': {
      // The outermost cell on the right of the top row, wherever the head style puts it.
      const row = c.cells[l.top] ?? [];
      let x = row.length - 1;
      while (x > CENTER && row[x] === Role.Empty) x--;
      c.paint(x, l.top, Role.Empty);
      c.paint(x - 1, l.top, Role.Empty);
      if (c.cells[l.top + 1]?.[x - 1] === Role.Body) c.paint(x - 1, l.top + 1, Role.Shade);
      break;
    }
    case 'patch': {
      const x = CENTER - hw + 1;
      onBody(c, x, l.bottom - 1, Role.Accent);
      onBody(c, x + 1, l.bottom - 1, Role.Accent);
      onBody(c, x, l.bottom - 2, Role.Accent);
      break;
    }
    case 'antenna': {
      const x = CENTER + hw - 2;
      const tip = antennaTip(l.top);
      for (let row = l.top - 1; row > tip; row--) c.paint(x, row, Role.Shade);
      c.paint(x, tip, Role.Accent);
      break;
    }
    case 'none':
      break;
  }
}

/**
 * Draws the accessory: headphones, a visor band, a bow or a cap.
 *
 * @param c - Canvas to draw on
 * @param t - The robot's traits
 * @param l - Shared layout
 */
export function drawAccessory(c: Canvas, t: Traits, l: Layout): void {
  const hw = t.halfWidth;
  const out = hw + (t.head === 'tv' ? 2 : 1);
  switch (t.accessory) {
    case 'headphones':
      for (let dx = 0; dx < out; dx++) c.mirror(dx, l.top - 1, Role.Shade);
      for (let y = l.top; y < l.eyeRow; y++) c.mirror(out, y, Role.Shade);
      for (let dy = 0; dy <= 2; dy++) c.mirror(out, l.eyeRow + dy, Role.Accent);
      break;
    case 'visor':
      for (let dx = hw - 1; dx <= out; dx++) c.mirror(dx, l.eyeRow, Role.Accent);
      break;
    case 'bow': {
      const x = CENTER + hw - 2;
      for (const [dx, dy] of [
        [-1, -1],
        [-1, -2],
        [0, -1],
        [1, -1],
        [1, -2],
      ] as const)
        c.paint(x + dx, l.top + dy, Role.Accent);
      break;
    }
    case 'cap':
      for (let dx = 0; dx <= hw; dx++) c.mirror(dx, l.top - 1, Role.Accent);
      for (let dx = 0; dx < hw - 1; dx++) c.mirror(dx, l.top - 2, Role.Accent);
      // The peak sticks out on the right.
      c.paint(CENTER + hw + 1, l.top - 1, Role.Accent);
      c.paint(CENTER + hw + 2, l.top - 1, Role.Accent);
      break;
    case 'none':
      break;
  }
}
