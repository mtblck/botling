import { type Canvas, tagged } from '../../../../core/canvas.js';
import { Role, type Traits } from '../../types.js';
import type { SmallLayout } from './layout.js';

/**
 * Draws the small eyes. Styles collapse to the shape they read as at 24px:
 * a dot, a tall bar, a wide bar, a visor or one centre eye. Happy eyes are a
 * dot here, angry ones keep a brow and a wink keeps one eye shut.
 *
 * @param c - Canvas to draw on
 * @param t - The robot's traits
 * @param l - Small layout
 */
export function drawSmallEyes(c: Canvas, t: Traits, l: SmallLayout): void {
  const { eyeRow: y, eyeX: x } = l;
  const eye = (dx: number, row: number): void => c.mirror(dx, row, Role.Glow);
  switch (t.eyes) {
    case 'visor':
      for (let dx = 0; dx < l.halfWidth; dx++) eye(dx, y);
      break;
    case 'cyclops':
    case 'ring':
      eye(0, y);
      if (t.eyes === 'cyclops') eye(0, y + 1);
      break;
    case 'tall':
    case 'block':
      eye(x, y);
      eye(x, y + 1);
      break;
    case 'slit':
      if (x >= 2) eye(x - 1, y);
      eye(x, y);
      break;
    case 'sleepy':
      eye(x, y + 1);
      break;
    case 'angry':
      tagged(c, null, () => c.mirror(x, y, Role.Accent));
      eye(x, y + 1);
      break;
    case 'surprised':
      eye(x, y);
      eye(x, y + 1);
      if (x >= 2) {
        eye(x - 1, y);
        eye(x - 1, y + 1);
      }
      break;
    case 'wink':
      c.paint(c.center - x, y, Role.Glow);
      c.paint(c.center - x, y + 1, Role.Glow);
      tagged(c, null, () => c.paint(c.center + x, y + 1, Role.Glow));
      break;
    case 'mismatch':
      c.paint(c.center - x, y, Role.Glow);
      c.paint(c.center - x, y + 1, Role.Glow);
      c.paint(c.center + x, y, Role.Accent);
      break;
    default:
      eye(x, y);
  }
}

/**
 * Draws the small mouth on the row above the chin.
 *
 * @param c - Canvas to draw on
 * @param t - The robot's traits
 * @param l - Small layout
 */
export function drawSmallMouth(c: Canvas, t: Traits, l: SmallLayout): void {
  const y = l.mouthRow;
  const isWide = l.halfWidth >= 3;
  switch (t.mouth) {
    // A smile's raised corners would land on tall eyes at this size, so it
    // draws as a line, like teeth.
    case 'line':
    case 'smile':
    case 'teeth':
      c.mirror(0, y, Role.Glow);
      if (isWide) c.mirror(1, y, Role.Glow);
      break;
    case 'grille':
    case 'zigzag':
      c.mirror(0, y, Role.Glow);
      if (isWide) c.mirror(2, y, Role.Glow);
      break;
    case 'speaker':
      c.mirror(0, y, Role.Accent);
      break;
    case 'dots':
      c.mirror(1, y, Role.Glow);
      break;
    case 'o':
      c.mirror(0, y, Role.Glow);
      break;
    // The mouth gets one row here, so a frown's corners and a zigzag's
    // peaks would touch the eyes: a frown draws as a small line, a zigzag as
    // a grille and a grin as a line across the whole screen.
    case 'frown':
      c.mirror(0, y, Role.Glow);
      break;
    case 'grin':
      for (let dx = 0; dx < l.halfWidth; dx++) c.mirror(dx, y, Role.Glow);
      break;
    case 'none':
      break;
  }
}
