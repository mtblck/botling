import { type Canvas, canvas, type Draw, dots, type Form, frames, pick, Role, rows, span } from './draw.js';

const STARS = frames('2,2 12,12 | 12,1 2,12 | 12,2 1,13 | 2,12 13,1');
const SMALL_STARS = frames('0,0 8,7 | 8,1 1,8 | 7,0 0,7 | 1,8 8,0');

/** Twinkles a plus-shaped star and a single-cell star in the corners. */
const twinkle = (c: Canvas, f: number, role: Role): void => {
  const [[px, py], [dx, dy]] = pick(STARS, f) as [[number, number], [number, number]];
  dots(
    c,
    [
      [px, py],
      [px - 1, py],
      [px + 1, py],
      [px, py - 1],
      [px, py + 1],
      [dx, dy],
    ],
    role,
  );
};

const planet: Draw = (f) => {
  const c = canvas(15);
  const w = [2, 3, 4, 4, 4, 4, 4, 3, 2];
  rows(c, 3, w, undefined, Role.Body, Role.Body);
  w.forEach((n, i) => {
    dots(
      c,
      [
        [7 + n, 3 + i],
        [6 + n, 3 + i],
      ],
      Role.Shade,
    );
  });
  span(c, 7, 1, 13, Role.Accent, Role.Accent);
  twinkle(c, f, Role.Screen);
  return { c, at: { x: 7, dx: 2, y: 5 } };
};

const planetSmall: Draw = (f) => {
  const c = canvas(9);
  const w = [1, 2, 3, 2, 1];
  rows(c, 2, w, undefined, Role.Body, Role.Body);
  w.forEach((n, i) => {
    c.paint(4 + n, 2 + i, Role.Shade);
  });
  span(c, 4, 0, 8, Role.Accent, Role.Accent);
  dots(c, pick(SMALL_STARS, f), Role.Screen);
  return { c, at: { x: 4, dx: 1, y: 3 } };
};

const star: Draw = (f) => {
  const c = canvas(15);
  if (f % 2) rows(c, 2, [0, 1, 1, 2, 3, 5, 3, 2, 1, 1, 0], undefined, Role.Body, Role.Body);
  else rows(c, 1, [0, 0, 1, 1, 2, 3, 6, 3, 2, 1, 1, 0, 0], undefined, Role.Body, Role.Body);
  dots(c, frames('8,8 9,7 8,9 7,9 8,10')[0] ?? [], Role.Shade);
  twinkle(c, f + 1, Role.Accent);
  return { c, at: { x: 7, dx: 1, y: 6 } };
};

const starSmall: Draw = (f) => {
  const c = canvas(9);
  if (f % 2) rows(c, 1, [0, 1, 1, 3, 1, 1, 0], undefined, Role.Body, Role.Body);
  else rows(c, 0, [0, 0, 1, 1, 4, 1, 1, 0, 0], undefined, Role.Body, Role.Body);
  c.paint(5, 5, Role.Shade);
  dots(c, pick(SMALL_STARS, f + 1), Role.Accent);
  return { c, at: { x: 4, dx: 1, y: 3 } };
};

/** A ringed planet and a four-point star, with stars twinkling in the corners. */
export const SPACE: Record<'planet' | 'star', Form> = {
  planet: { full: planet, small: planetSmall },
  star: { full: star, small: starSmall },
};
