import type { Traits } from '../types.js';

/** Rows and columns that several part builders share. */
export interface Layout {
  top: number;
  bottom: number;
  eyeRow: number;
  mouthRow: number;
  /** Eye column, as cells left of centre. */
  eyeX: number;
}

/**
 * Works out where the head sits and where the face goes inside it.
 *
 * @param t - The robot's traits
 * @returns Shared rows and columns
 */
export function layout(t: Traits): Layout {
  const top = t.topRow;
  // Shoulders take rows 13-14 and the neck row 12, so the head stops at 11.
  const bottom = Math.min(t.bottomRow, t.hasShoulders ? 11 : 13);
  return {
    top,
    bottom,
    eyeRow: top + (bottom - top >= 7 ? 3 : 2),
    mouthRow: bottom - 2,
    eyeX: Math.min(t.eyeGap + 1, t.halfWidth - 2),
  };
}
