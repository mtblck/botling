import { type Anchor, type Canvas, Role } from './draw.js';

export const EYES = ['dots', 'round', 'happy', 'sleepy', 'wink'] as const;
export const MOUTHS = ['none', 'dot', 'smile', 'grin'] as const;
export type Eyes = (typeof EYES)[number];
export type Mouth = (typeof MOUTHS)[number];

/** A sprite's face. */
export interface Face {
  eyes: Eyes;
  mouth: Mouth;
  blush: boolean;
}

type Cell = readonly [number, number];

/** The eye cells left of centre, as offsets from the anchor; the right eye mirrors them. */
const eyeCells = (eyes: Eyes, dx: number): Cell[] => {
  const inner = Math.max(dx - 1, 1);
  switch (eyes) {
    case 'round':
      return [
        [inner, 0],
        [inner + 1, 0],
        [inner, 1],
        [inner + 1, 1],
      ];
    case 'happy':
      return [
        [dx, 0],
        [dx - 1, 1],
        [dx + 1, 1],
      ];
    case 'sleepy':
      return [
        [inner, 1],
        [inner + 1, 1],
      ];
    default:
      return [
        [dx, 0],
        [dx, 1],
      ];
  }
};

const MOUTH_CELLS: Record<Mouth, Cell[]> = {
  none: [],
  dot: [[0, 3]],
  smile: [
    [-1, 3],
    [1, 3],
    [0, 4],
  ],
  grin: [
    [-1, 3],
    [0, 3],
    [1, 3],
  ],
};

/**
 * Paints a face at a form's anchor. On the 9x9 grid there's room for one
 * cell per eye and one for the mouth, so every face shrinks to that.
 */
export function paintFace(c: Canvas, at: Anchor, face: Face, small: boolean): void {
  const { x, dx, y } = at;
  if (small) {
    for (const s of [-1, 1]) c.paint(x + s * dx, y, Role.Glow);
    if (face.mouth !== 'none') c.paint(x, y + 2, Role.Glow);
    return;
  }
  // A wink is open on the left and shut on the right.
  const left = eyeCells(face.eyes === 'wink' ? 'dots' : face.eyes, dx);
  const right = face.eyes === 'wink' ? eyeCells('sleepy', dx) : left;
  for (const [ex, ey] of left) c.paint(x - ex, y + ey, Role.Glow);
  for (const [ex, ey] of right) c.paint(x + ex, y + ey, Role.Glow);
  for (const [mx, my] of MOUTH_CELLS[face.mouth]) c.paint(x + mx, y + my, Role.Glow);
  if (face.blush) for (const s of [-1, 1]) c.paint(x + s * (dx + 2), y + 2, Role.Accent);
}
