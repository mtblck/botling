import type { Traits } from '../../types.js';
import { slots } from '../slots.js';

/** Rows and columns of the small grid that several part builders share. */
export interface SmallLayout {
  /** Head half-width in cells, not counting the centre column. */
  halfWidth: number;
  top: number;
  bottom: number;
  eyeRow: number;
  mouthRow: number;
  /** Eye column, as cells left of centre. */
  eyeX: number;
}

/**
 * Maps a robot's traits onto the 9x9 grid. Heads come in two widths here,
 * so the three detailed widths fold down to narrow (3) and wide (4 and 5).
 *
 * @param t - The robot's traits
 * @returns Shared rows and columns
 */
export function smallLayout(t: Traits): SmallLayout {
  const halfWidth = t.halfWidth >= 4 ? 3 : 2;
  // Leave row 0-1 for the top piece when there is one; otherwise grow the head up.
  const top = slots(t).isTopped ? 2 : 1;
  const bottom = 7;
  return {
    halfWidth,
    top,
    bottom,
    // Fixed, so two-row eyes always leave a clear row above the mouth.
    eyeRow: 3,
    mouthRow: bottom - 1,
    eyeX: halfWidth === 3 && t.eyeGap >= 2 ? 2 : 1,
  };
}
