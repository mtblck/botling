import { type Canvas, createCanvas, dots, eyes, Role, rows, span } from './draw.js';
import type { Draw } from './full.js';

const C = 4;
const SWAY = [0, 1, 0, -1] as const;
const sway = (f: number): number => SWAY[f % 4] as number;
const pick = <T>(list: readonly T[], f: number): T => list[f % list.length] as T;
const grid = (): Canvas => createCanvas(9);

const EMBERS = [[[1, 2]], [[7, 1]], [[1, 0]], [[7, 3]]] as const;

const flame: Draw = (f, e) => {
  const c = grid();
  rows(c, 1, [0, 0, 1, 1, 2, 2, 3, 2], (i) => (i === 0 ? sway(f) : 0));
  rows(c, 6, [0, 1], undefined, Role.Screen, Role.Screen);
  dots(c, pick(EMBERS, f), Role.Accent);
  if (e) eyes(c, 1, 5);
  return c;
};

const wisp: Draw = (f, e) => {
  const c = grid();
  rows(c, 1, [0, 0, 1], (i) => (i < 2 ? sway(f) : 0));
  rows(c, 4, [2, 3, 3, 3, 2]);
  rows(c, 6, [1, 1], undefined, Role.Screen, Role.Screen);
  dots(c, pick(EMBERS, f + 1), Role.Accent);
  if (e) eyes(c, 1, 5);
  return c;
};

const BUBBLES = [[[8, 6]], [[8, 4]], [[7, 2]], [[8, 0]]] as const;

const drop: Draw = (f, e) => {
  const c = grid();
  const s = f % 2;
  if (s) rows(c, 2, [0, 1, 2, 3, 4, 3, 2]);
  else rows(c, 1, [0, 0, 1, 2, 3, 3, 3, 2]);
  c.paint(C - 2, 5 + s, Role.Screen);
  dots(c, pick(BUBBLES, f), Role.Accent);
  if (e) eyes(c, 1, 6);
  return c;
};

const bubble: Draw = (f, e) => {
  const c = grid();
  const s = f % 2;
  if (s) rows(c, 2, [2, 3, 4, 4, 3, 2]);
  else rows(c, 1, [1, 2, 3, 3, 3, 2, 1]);
  dots(
    c,
    [
      [C - 1, 2 + s],
      [C - 2, 3 + s],
    ],
    Role.Screen,
  );
  dots(c, pick(BUBBLES, f + 2), Role.Accent);
  if (e) eyes(c, 1, 4);
  return c;
};

const boulder: Draw = (f, e) => {
  const c = grid();
  span(c, 4, C - 2, C + 1);
  for (let y = 5; y <= 7; y++) span(c, y, C - 3, C + 3);
  span(c, 8, C - 3, C + 3, Role.Shade);
  c.paint(C, 3, Role.Accent);
  c.paint(C + (f % 2 ? 1 : -1), 2, Role.Accent);
  if (e) eyes(c, 1, 6);
  return c;
};

const crystal: Draw = (f, e) => {
  const c = grid();
  const w = [2, 3, 3, 2, 2, 1, 0];
  rows(c, 1, w);
  w.forEach((n, i) => {
    for (let x = C + 1; x < C + n; x++) c.paint(x, 1 + i, Role.Shade);
  });
  if (f === 0) c.paint(C - 1, 1, Role.Screen);
  if (f === 2) c.paint(C - 2, 3, Role.Screen);
  if (e) eyes(c, 1, 3);
  return c;
};

const puff: Draw = (f, e) => {
  const c = grid();
  const m = C + 1;
  const shape = [
    [1, 1],
    [3, 2],
    [3, 3],
    [2, 2],
  ] as const;
  shape.forEach(([l, r], i) => span(c, 3 + i, m - l, m + r));
  for (const [y, max, p] of [
    [2, 4, f],
    [7, 3, f + 1],
  ] as const) {
    for (let x = p % 3; x < (p % 3) + 2 && x < max; x++) c.paint(x, y, Role.Accent);
  }
  if (e)
    dots(
      c,
      [
        [m - 1, 4],
        [m + 1, 4],
      ],
      Role.Glow,
    );
  return c;
};

const tornado: Draw = (f, e) => {
  const c = grid();
  const w = [4, 3, 3, 2, 2, 1, 1, 0];
  const shift = (i: number): number => (i >= 4 ? Math.trunc((sway(f) * (i - 2)) / 2) : 0);
  rows(c, 1, w, shift);
  const y = 4 + (f % 2);
  const n = w[y - 1] ?? 0;
  span(c, y, C + shift(y - 1) - n + 1, C + shift(y - 1) + n - 1, Role.Shade, Role.Shade);
  if (e) eyes(c, 1, 2);
  return c;
};

const STARS = [
  [0, 0, 8, 7],
  [8, 1, 1, 8],
  [7, 0, 0, 7],
  [1, 8, 8, 0],
] as const;
const twinkle = (c: Canvas, f: number, role: Role): void => {
  const [ax, ay, bx, by] = pick(STARS, f);
  dots(
    c,
    [
      [ax, ay],
      [bx, by],
    ],
    role,
  );
};

const planet: Draw = (f, e) => {
  const c = grid();
  const w = [1, 2, 3, 2, 1];
  rows(c, 2, w, undefined, Role.Body, Role.Body);
  w.forEach((n, i) => c.paint(C + n, 2 + i, Role.Shade));
  span(c, 4, C - 4, C + 4, Role.Accent, Role.Accent);
  twinkle(c, f, Role.Screen);
  if (e) eyes(c, 1, 3);
  return c;
};

const star: Draw = (f, e) => {
  const c = grid();
  if (f % 2) rows(c, 1, [0, 1, 1, 3, 1, 1, 0], undefined, Role.Body, Role.Body);
  else rows(c, 0, [0, 0, 1, 1, 4, 1, 1, 0, 0], undefined, Role.Body, Role.Body);
  c.paint(C + 1, 5, Role.Shade);
  twinkle(c, f + 1, Role.Accent);
  if (e) eyes(c, 1, 3);
  return c;
};

/** Every element's two forms on the 9x9 grid, drawn for 24-39px. */
export const SMALL = { flame, wisp, drop, bubble, boulder, crystal, puff, tornado, planet, star } as const;
