import { type Canvas, CENTER, tagged } from '../../../core/canvas.js';
import { Role, type Traits } from '../types.js';
import { drawExpressionEyes, drawExpressionMouth } from './expressions.js';
import type { Layout } from './layout.js';

/**
 * Draws both eyes. Every style is mirrored except `mismatch`, which has one
 * tall glowing eye and one small accent eye, and `wink`.
 *
 * @param c - Canvas to draw on
 * @param t - The robot's traits
 * @param l - Shared layout
 */
export function drawEyes(c: Canvas, t: Traits, l: Layout): void {
  if (drawExpressionEyes(c, t, l)) return;
  const { eyeRow: y, eyeX: x } = l;
  const eye = (dx: number, row: number): void => c.mirror(dx, row, Role.Glow);
  switch (t.eyes) {
    case 'dot':
      eye(x, y);
      break;
    case 'block':
      for (const [dx, dy] of [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
      ] as const)
        eye(x + dx, y + dy);
      break;
    case 'tall':
      eye(x, y);
      eye(x, y + 1);
      break;
    case 'slit':
      eye(x, y);
      eye(x + 1, y);
      break;
    case 'visor':
      for (let dx = 0; dx <= t.halfWidth - 2; dx++) eye(dx, y);
      break;
    case 'cyclops':
      for (const [dx, dy] of [
        [0, -1],
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
      ] as const)
        eye(dx, y + dy);
      break;
    case 'ring':
      for (const [dx, dy] of [
        [0, -1],
        [1, 0],
        [0, 1],
        [-1, 0],
      ] as const)
        eye(x + dx, y + dy);
      break;
    case 'cross':
      for (const [dx, dy] of [
        [0, 0],
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ] as const)
        eye(x + dx, y + dy);
      break;
    case 'sleepy':
      for (let dx = -1; dx <= 1; dx++) eye(x + dx, y + 1);
      break;
    case 'mismatch':
      c.paint(CENTER - x, y, Role.Glow);
      c.paint(CENTER - x, y + 1, Role.Glow);
      c.paint(CENTER + x, y, Role.Accent);
      break;
  }
}

/**
 * Draws the mouth, and cheeks when the robot has them and a screen to put them on.
 *
 * @param c - Canvas to draw on
 * @param t - The robot's traits
 * @param l - Shared layout
 */
export function drawMouth(c: Canvas, t: Traits, l: Layout): void {
  const y = l.mouthRow;
  const width = Math.min(t.halfWidth - 2, 3);
  const mouth = (dx: number, row: number, role: Role = Role.Glow): void => c.mirror(dx, row, role);
  switch (t.mouth) {
    case 'line':
      for (let dx = 0; dx < width; dx++) mouth(dx, y);
      break;
    case 'grille':
      for (let dx = 0; dx <= width; dx += 2) mouth(dx, y);
      break;
    case 'smile':
      for (let dx = 0; dx < width; dx++) mouth(dx, y);
      mouth(width, y - 1);
      break;
    case 'teeth':
      for (let dx = 0; dx < width; dx++) {
        mouth(dx, y - 1);
        if (dx % 2 === 0) mouth(dx, y);
      }
      break;
    case 'dots':
      mouth(1, y);
      break;
    case 'speaker':
      for (let dx = 0; dx < width; dx += 2) {
        mouth(dx, y - 1, Role.Accent);
        mouth(dx, y, Role.Accent);
      }
      break;
    case 'o':
      mouth(0, y - 1);
      mouth(1, y);
      mouth(0, y + 1 > l.bottom - 1 ? y : y + 1);
      break;
    case 'none':
      break;
    default:
      drawExpressionMouth(c, t, l, width);
  }
  // Cheeks stay put when the mouth moves.
  if (t.hasCheeks && t.hasScreen) tagged(c, null, () => c.mirror(l.eyeX + 1, l.eyeRow + 2, Role.Accent));
}
