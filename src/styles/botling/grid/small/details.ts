import type { Canvas } from '../../../../core/canvas.js';
import { Role, type Traits } from '../../types.js';
import { slots } from '../slots.js';
import type { SmallLayout } from './layout.js';

/**
 * Draws the small quirk and accessory. Head markings and the chest light
 * are left out at this size; they read as noise.
 *
 * @param c - Canvas to draw on
 * @param t - The robot's traits
 * @param l - Small layout
 */
export function drawSmallDetails(c: Canvas, t: Traits, l: SmallLayout): void {
  const hw = l.halfWidth;
  const out = hw + 1;
  const right = c.center + hw - 1;
  if (slots(t).hasQuirk) {
    switch (t.quirk) {
      case 'ear':
        c.paint(c.center - out, l.eyeRow, Role.Shade);
        c.paint(c.center - out, l.eyeRow + 1, Role.Shade);
        break;
      case 'dent': {
        // The outermost cell on the right of the top row, wherever the head style puts it.
        let x = c.center + hw;
        while (x > c.center && c.cells[l.top]?.[x] === Role.Empty) x--;
        c.paint(x, l.top, Role.Empty);
        break;
      }
      case 'patch':
        if (c.cells[l.bottom - 1]?.[c.center - hw + 1] === Role.Body)
          c.paint(c.center - hw + 1, l.bottom - 1, Role.Accent);
        break;
      case 'antenna':
        c.paint(right, l.top - 1, Role.Shade);
        c.paint(right, l.top - 2, Role.Accent);
        break;
      case 'none':
        break;
    }
  }
  switch (t.accessory) {
    case 'headphones':
      for (let dx = 0; dx < out; dx++) c.mirror(dx, l.top - 1, Role.Shade);
      for (let y = l.top; y < l.eyeRow; y++) c.mirror(out, y, Role.Shade);
      c.mirror(out, l.eyeRow, Role.Accent);
      c.mirror(out, l.eyeRow + 1, Role.Accent);
      break;
    case 'visor':
      c.mirror(hw, l.eyeRow, Role.Accent);
      c.mirror(out, l.eyeRow, Role.Accent);
      break;
    case 'bow':
      for (let dx = -1; dx <= 1; dx++) c.paint(right + dx, l.top - 1, Role.Accent);
      c.paint(right - 1, l.top - 2, Role.Accent);
      c.paint(right + 1, l.top - 2, Role.Accent);
      break;
    case 'cap':
      for (let dx = 0; dx <= hw; dx++) c.mirror(dx, l.top - 1, Role.Accent);
      c.paint(c.center + out, l.top - 1, Role.Accent);
      break;
    case 'none':
      break;
  }
}
