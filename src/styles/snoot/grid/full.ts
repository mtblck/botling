import { blob, stamp } from '../../../core/art.js';
import { type Canvas, createCanvas, tagged } from '../../../core/canvas.js';
import { Role, type SnootTraits } from '../types.js';
import { drawEyes, drawMarking, drawMouth, drawMuzzle } from './face.js';

/** Ears for each species, as left-half art whose last row sits on the head's top row. Outer edge first. */
const EARS: Readonly<Partial<Record<string, { art: readonly string[]; ox: number }>>> = {
  cat: { art: ['S..', 'SS.', 'SAS'], ox: 0 },
  fox: { art: ['S...', 'SS..', 'SAS.', 'SAAS'], ox: 0 },
  bear: { art: ['.SS.', 'SAAS'], ox: 0 },
  panda: { art: ['.SS.', 'SSSS'], ox: 0 },
  mouse: { art: ['.SSS.', 'SAAAS', 'SAAAS'], ox: -2 },
  bunny: { art: ['.S.', 'SAS', 'SAS', 'SAS', 'SAS'], ox: 1 },
  owl: { art: ['S.', 'SS'], ox: 0 },
  pig: { art: ['SS', 'SA'], ox: 0 },
};

/** A frog's eyes sit on bumps above its head, drawn for each kind of eye. */
const FROG_EYES: Readonly<Record<string, readonly string[]>> = {
  dot: ['.BBB.', 'BCGCB'],
  tall: ['.BGB.', 'BCGCB'],
  shine: ['.BBB.', 'BGCGB'],
  sleepy: ['.BBB.', 'BSSSB'],
  happy: ['.GBG.', 'BCBCB'],
};

/** The detailed head's top row. */
const TOP = 5;

/** Paints ear art left of centre and its mirror, with its last row on `bottomRow`. */
function ears(c: Canvas, art: readonly string[], col: number, bottomRow: number): void {
  const top = bottomRow - art.length + 1;
  stamp(c, art, col, top);
  stamp(c, art, col, top, true);
}

/**
 * Draws the detailed 15x15 Snoot: a head, the species' ears, markings, eyes,
 * muzzle, cheeks and an extra.
 *
 * @param t - The Snoot's traits
 * @returns The canvas
 */
export function drawGrid(t: SnootTraits): Canvas {
  const c = createCanvas();
  const isFrog = t.species === 'frog';
  const hw = isFrog ? t.halfWidth + 1 : t.halfWidth;
  const tall = t.isTall ? [hw] : [];
  const rows = isFrog ? [hw - 1, hw, hw, ...tall, hw, hw, hw - 1] : [hw - 1, hw, hw, hw, ...tall, hw, hw - 1, hw - 2];
  const left = c.center - hw;
  blob(c, TOP, rows, Role.Body, Role.Shade);
  const ear = EARS[t.species];
  // Tagged parts move when animated: ears twitch and eyes blink.
  if (ear) tagged(c, 'top', () => ears(c, ear.art, left + ear.ox, TOP));
  if (isFrog) tagged(c, 'eyes', () => ears(c, FROG_EYES[t.eyes] ?? [], left + 1, TOP));
  if (t.species === 'dog')
    tagged(c, 'sides', () => ears(c, ['SSS', 'SSS', 'SS.', 'SS.', 'SS.', '.S.'], left - 1, TOP + 4));
  const eyeRow = TOP + 2;
  const eyeX = Math.min(hw - 2, 2 + (hw > 4 ? 1 : 0));
  drawMarking(c, t, { top: TOP, eyeRow, eyeX, hw });
  if (t.species === 'owl') {
    for (const dx of [eyeX - 1, eyeX, eyeX + 1])
      for (let y = eyeRow - 1; y <= eyeRow + 1; y++) c.mirror(dx, y, Role.Screen);
  }
  if (!isFrog) tagged(c, 'eyes', () => drawEyes(c, t, eyeRow, eyeX));
  drawMuzzle(c, t, eyeRow + 2, hw, TOP + rows.length - 1);
  drawMouth(c, t, eyeRow + 2, TOP + rows.length - 1);
  if (t.hasCheeks && t.species !== 'owl') c.mirror(eyeX + 1, eyeRow + 2, Role.Accent);
  if (t.extra === 'bow') stamp(c, ['A.A', 'AAA', 'A.A'], c.center - hw - 1, TOP - 2);
  else if (t.extra === 'flower') stamp(c, ['.A.', 'ACA', '.A.'], c.center + hw - 1, TOP - 2);
  else if (t.extra === 'whiskers' && !isFrog) {
    c.mirror(hw + 1, eyeRow + 2, Role.Shade);
    c.mirror(hw + 1, eyeRow + 3, Role.Shade);
  }
  return c;
}
