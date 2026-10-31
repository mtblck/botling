import { canvas, type Draw, dots, type Form, frames, pick, Role, rows } from './draw.js';

const BUBBLES = frames('12,11 2,5 | 12,9 1,3 | 13,7 2,1 | 12,5 1,12');
const SMALL_BUBBLES = frames('8,6 | 8,4 | 7,2 | 8,0');

const drop: Draw = (f) => {
  const c = canvas(15);
  const s = f % 2;
  if (s) rows(c, 2, [0, 1, 1, 2, 3, 4, 5, 5, 5, 5, 4, 3]);
  else rows(c, 1, [0, 0, 1, 1, 2, 3, 4, 4, 5, 5, 5, 4, 3]);
  dots(c, frames(`5,${6 + s} 4,${7 + s} 4,${8 + s}`)[0] ?? [], Role.Screen);
  dots(c, pick(BUBBLES, f), Role.Accent);
  return { c, at: { x: 7, dx: 2, y: 9 } };
};

const dropSmall: Draw = (f) => {
  const c = canvas(9);
  const s = f % 2;
  if (s) rows(c, 2, [0, 1, 2, 3, 4, 3, 2]);
  else rows(c, 1, [0, 0, 1, 2, 3, 3, 3, 2]);
  c.paint(2, 5 + s, Role.Screen);
  dots(c, pick(SMALL_BUBBLES, f), Role.Accent);
  return { c, at: { x: 4, dx: 1, y: 6 } };
};

const bubble: Draw = (f) => {
  const c = canvas(15);
  const s = f % 2;
  if (s) rows(c, 4, [3, 4, 5, 6, 6, 6, 5, 4, 3]);
  else rows(c, 3, [2, 3, 4, 5, 5, 5, 5, 4, 3, 2]);
  dots(c, frames(`5,${4 + s} 4,${5 + s} 3,${6 + s}`)[0] ?? [], Role.Screen);
  dots(c, pick(BUBBLES, f + 2), Role.Accent);
  return { c, at: { x: 7, dx: 2, y: 8 } };
};

const bubbleSmall: Draw = (f) => {
  const c = canvas(9);
  const s = f % 2;
  if (s) rows(c, 2, [2, 3, 4, 4, 3, 2]);
  else rows(c, 1, [1, 2, 3, 3, 3, 2, 1]);
  dots(c, frames(`3,${2 + s} 2,${3 + s}`)[0] ?? [], Role.Screen);
  dots(c, pick(SMALL_BUBBLES, f + 2), Role.Accent);
  return { c, at: { x: 4, dx: 1, y: 4 } };
};

/** A wobbling drop and a round blob, with bubbles rising past. */
export const WATER: Record<'drop' | 'bubble', Form> = {
  drop: { full: drop, small: dropSmall },
  bubble: { full: bubble, small: bubbleSmall },
};
