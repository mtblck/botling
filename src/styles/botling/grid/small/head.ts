import type { Canvas } from '../../../../core/canvas.js';
import { Role, type Traits } from '../../types.js';
import type { SmallLayout } from './layout.js';

/**
 * Half-width of the small head on one row. Each head style keeps one
 * recognisable feature at this size: a narrow top, a narrow bottom, or both.
 *
 * @param t - The robot's traits
 * @param l - Small layout
 * @param y - Row
 * @returns Cells left of centre, or -1 to skip the row
 */
function rowWidth(t: Traits, l: SmallLayout, y: number): number {
  const isTop = y === l.top;
  const isBottom = y === l.bottom;
  switch (t.head) {
    case 'dome':
    case 'bucket':
      return isTop ? l.halfWidth - 1 : l.halfWidth;
    case 'wedge':
      return isBottom ? l.halfWidth - 1 : l.halfWidth;
    case 'capsule':
      return isTop || isBottom ? l.halfWidth - 1 : l.halfWidth;
    default:
      return l.halfWidth;
  }
}

const CLIPPED_CORNERS = new Set(['rounded', 'tv', 'dome']);

/**
 * Draws the small head, its shaded edge and, if the robot has one, the screen.
 *
 * @param c - Canvas to draw on
 * @param t - The robot's traits
 * @param l - Small layout
 */
export function drawSmallHead(c: Canvas, t: Traits, l: SmallLayout): void {
  for (let y = l.top; y <= l.bottom; y++) {
    const w = rowWidth(t, l, y);
    for (let dx = 0; dx <= w; dx++) {
      const isCorner = dx === w && (y === l.top || y === l.bottom);
      if (isCorner && CLIPPED_CORNERS.has(t.head)) continue;
      c.mirror(dx, y, dx === w ? Role.Shade : Role.Body);
    }
  }
  if (!t.hasScreen) return;
  for (let y = Math.max(l.top + 1, l.eyeRow - 1); y <= l.mouthRow; y++) {
    for (let dx = 0; dx < l.halfWidth; dx++) c.mirror(dx, y, Role.Screen);
  }
}
