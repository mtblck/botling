import { type Canvas, canvas, type Draw, dots, type Form, frames, pick, Role, rows, span, sway } from './draw.js';

/** Speed lines, each ending in a little curl, drifting one cell per frame. */
const GUSTS = frames(
  '0,6 1,6 2,6 3,5 1,10 2,10 3,10 | 1,6 2,6 3,6 4,5 0,10 1,10 2,10 3,9 | 0,8 1,8 2,8 3,7 | 1,8 2,8 3,8 2,11 3,11',
);
const SMALL_GUSTS = frames('0,3 1,3 2,2 | 1,3 2,3 | 0,6 1,6 2,5 | 1,6 2,6');

const puff: Draw = (f) => {
  const c = canvas(15);
  const m = 8;
  if (f % 2) span(c, 4, m, m + 1);
  const shape = [
    [1, 2],
    [3, 3],
    [4, 4],
    [4, 5],
    [4, 5],
    [3, 4],
    [1, 2],
  ];
  shape.forEach(([l = 0, r = 0], i) => {
    span(c, 5 + i, m - l, m + r);
  });
  dots(c, pick(GUSTS, f), Role.Accent);
  return { c, at: { x: m, dx: 2, y: 7 } };
};

const puffSmall: Draw = (f) => {
  const c = canvas(9);
  const m = 5;
  const shape = [
    [1, 1],
    [2, 2],
    [2, 3],
    [1, 2],
  ];
  shape.forEach(([l = 0, r = 0], i) => {
    span(c, 3 + i, m - l, m + r);
  });
  dots(c, pick(SMALL_GUSTS, f), Role.Accent);
  return { c, at: { x: m, dx: 1, y: 4 } };
};

/** Paints a funnel's spinning bands: short dashes that slide down a row each frame. */
const bands = (
  c: Canvas,
  w: readonly number[],
  top: number,
  shift: (i: number) => number,
  f: number,
  gap: number,
): void => {
  for (let k = 0; k < w.length; k += gap) {
    const i = (k + f) % w.length;
    const n = w[i] ?? 0;
    if (n < 2) continue;
    const m = c.center + shift(i);
    const from = k % (2 * gap) ? m : m - n + 1;
    span(c, top + i, from, from + n - 2, Role.Shade, Role.Shade);
  }
};

const tornado: Draw = (f) => {
  const c = canvas(15);
  const w = [5, 6, 5, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0];
  const shift = (i: number): number => Math.trunc((sway(f) * i) / 5);
  rows(c, 1, w, shift, Role.Body, Role.Body);
  bands(c, w, 1, shift, f, 3);
  dots(c, pick(frames('1,5 13,9 | 2,8 12,4 | 1,11 13,6 | 2,3 12,10'), f), Role.Accent);
  return { c, at: { x: 7, dx: 2, y: 3 } };
};

const tornadoSmall: Draw = (f) => {
  const c = canvas(9);
  const w = [3, 4, 3, 2, 2, 1, 1, 0];
  const shift = (i: number): number => (i >= 4 ? Math.trunc((sway(f) * (i - 2)) / 2) : 0);
  rows(c, 1, w, shift, Role.Body, Role.Body);
  const y = 4 + (f % 2);
  const n = w[y - 1] ?? 0;
  span(c, y, 4 + shift(y - 1) - n, 4 + shift(y - 1) + n - 1, Role.Shade, Role.Shade);
  return { c, at: { x: 4, dx: 1, y: 2 } };
};

/** A cloud puff trailing curled speed lines, and a spinning funnel. */
export const WIND: Record<'puff' | 'tornado', Form> = {
  puff: { full: puff, small: puffSmall },
  tornado: { full: tornado, small: tornadoSmall },
};
