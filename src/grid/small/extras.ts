import { Role, type Traits } from '../../types.js';
import type { Canvas } from '../canvas.js';
import { slots } from '../slots.js';
import type { SmallLayout } from './layout.js';

/**
 * Draws the small top piece, ears or handles, and shoulders.
 *
 * @param c - Canvas to draw on
 * @param t - The robot's traits
 * @param l - Small layout
 */
export function drawSmallExtras(c: Canvas, t: Traits, l: SmallLayout): void {
  const y = l.top;
  const edge = l.halfWidth - 1;
  const s = slots(t);
  switch (s.hasTop ? t.top : 'none') {
    case 'antenna':
      c.mirror(0, y - 1, Role.Shade);
      c.mirror(0, y - 2, Role.Accent);
      break;
    case 'twin':
      c.mirror(edge, y - 1, Role.Accent);
      break;
    case 'horns':
      c.mirror(edge + 1, y - 1, Role.Accent);
      break;
    case 'fin':
      c.mirror(0, y - 1, Role.Accent);
      c.mirror(0, y - 2, Role.Accent);
      break;
    case 'dish':
      c.mirror(0, y - 1, Role.Shade);
      c.mirror(1, y - 2, Role.Accent);
      c.mirror(0, y - 2, Role.Accent);
      break;
    case 'bolt':
      c.mirror(0, y - 1, Role.Accent);
      break;
    case 'none':
      break;
  }

  const out = l.halfWidth + 1;
  switch (s.hasSides ? t.sides : 'none') {
    case 'ears':
      c.mirror(out, l.eyeRow, Role.Shade);
      c.mirror(out, l.eyeRow + 1, Role.Shade);
      break;
    case 'bolts':
    case 'handles':
      c.mirror(out, l.eyeRow + 1, Role.Accent);
      break;
    case 'none':
      break;
  }

  if (t.hasShoulders) {
    for (let dx = 0; dx <= l.halfWidth; dx++) c.mirror(dx, l.bottom + 1, dx === 0 ? Role.Accent : Role.Body);
  }
}
