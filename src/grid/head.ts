import { Role, type Traits } from '../types.js';
import type { Canvas } from './canvas.js';
import type { Layout } from './layout.js';

/**
 * Half-width of the head on one row, by head style.
 *
 * @param t - The robot's traits
 * @param fromTop - Rows below the head's top row
 * @param fromBottom - Rows above the head's bottom row
 * @returns Cells left of centre, not counting the centre column
 */
function rowWidth(t: Traits, fromTop: number, fromBottom: number): number {
  const hw = t.halfWidth;
  switch (t.head) {
    case 'dome':
      return Math.min(hw, hw - 2 + fromTop);
    case 'capsule':
      return fromTop === 0 || fromBottom === 0 ? hw - 2 : hw;
    case 'bucket':
      return Math.max(hw - 2, hw - Math.floor(fromTop / 3));
    case 'wedge':
      return Math.max(hw - 2, hw - Math.floor(fromBottom / 2));
    case 'tv':
      return hw + (fromTop > 0 && fromBottom > 0 ? 1 : 0);
    default:
      return hw;
  }
}

const CLIPPED_CORNERS = new Set(['rounded', 'capsule', 'tv']);

/**
 * Draws the head outline, its shaded edge and, if the robot has one, the screen.
 *
 * @param c - Canvas to draw on
 * @param t - The robot's traits
 * @param l - Shared layout
 */
export function drawHead(c: Canvas, t: Traits, l: Layout): void {
  for (let y = l.top; y <= l.bottom; y++) {
    const fromTop = y - l.top;
    const fromBottom = l.bottom - y;
    const w = rowWidth(t, fromTop, fromBottom);
    for (let dx = 0; dx <= w; dx++) {
      const isCorner = dx === w && (fromTop === 0 || fromBottom === 0);
      if (isCorner && CLIPPED_CORNERS.has(t.head)) continue;
      c.mirror(dx, y, dx === w ? Role.Shade : Role.Body);
    }
  }
  if (!t.hasScreen) return;
  for (let y = l.eyeRow - 1; y <= l.mouthRow + 1; y++) {
    for (let dx = 0; dx <= t.halfWidth - 2; dx++) c.mirror(dx, y, Role.Screen);
  }
}
