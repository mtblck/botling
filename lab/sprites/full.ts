import { type Canvas, createCanvas, dots, eyes, Role, rows, span } from './draw.js';

/** Draws one frame (0-3) of a form on the 15x15 grid, with or without eyes. */
export type Draw = (f: number, hasEyes: boolean) => Canvas;

const C = 7;
const SWAY = [0, 1, 0, -1] as const;
const sway = (f: number): number => SWAY[f % 4] as number;
const pick = <T>(list: readonly T[], f: number): T => list[f % list.length] as T;
const tip = (s: number, n: number) => (i: number) => (i < n ? Math.trunc((s * (n - i)) / 2) : 0);

const EMBERS = [
  [
    [2, 6],
    [12, 3],
  ],
  [
    [2, 4],
    [12, 9],
  ],
  [
    [3, 2],
    [11, 7],
  ],
  [
    [1, 9],
    [12, 5],
  ],
] as const;
const TONGUES = [
  [
    [C - 3, 5],
    [C - 4, 4],
  ],
  [[C + 4, 7]],
  [
    [C + 3, 5],
    [C + 4, 4],
  ],
  [[C - 4, 7]],
] as const;

const flame: Draw = (f, e) => {
  const c = createCanvas();
  rows(c, 1, [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 4, 3, 2], tip(sway(f), 4));
  dots(c, pick(TONGUES, f), Role.Shade);
  rows(c, 8, [0, 1, 1, 2, 1], undefined, Role.Screen, Role.Screen);
  if (f % 2) c.paint(C, 7, Role.Screen);
  dots(c, pick(EMBERS, f), Role.Accent);
  if (e) eyes(c, 2, 9, 2);
  return c;
};

const wisp: Draw = (f, e) => {
  const c = createCanvas();
  rows(c, 2, [0, 0, 1, 1, 2], tip(sway(f), 5));
  rows(c, 7, [2, 3, 4, 4, 4, 3, 2]);
  rows(c, 9, [1, 2, 2, 1], undefined, Role.Screen, Role.Screen);
  dots(c, pick(EMBERS, f + 1), Role.Accent);
  if (e) eyes(c, 2, 9, 2);
  return c;
};

const BUBBLES = [
  [
    [12, 11],
    [2, 5],
  ],
  [
    [12, 9],
    [1, 3],
  ],
  [
    [13, 7],
    [2, 1],
  ],
  [
    [12, 5],
    [1, 12],
  ],
] as const;

const drop: Draw = (f, e) => {
  const c = createCanvas();
  const s = f % 2;
  if (s) rows(c, 2, [0, 1, 1, 2, 3, 4, 5, 5, 5, 5, 4, 3]);
  else rows(c, 1, [0, 0, 1, 1, 2, 3, 4, 4, 5, 5, 5, 4, 3]);
  dots(
    c,
    [
      [C - 2, 6 + s],
      [C - 3, 7 + s],
      [C - 3, 8 + s],
    ],
    Role.Screen,
  );
  dots(c, pick(BUBBLES, f), Role.Accent);
  if (e) eyes(c, 2, 9, 2);
  return c;
};

const bubble: Draw = (f, e) => {
  const c = createCanvas();
  const s = f % 2;
  if (s) rows(c, 4, [3, 4, 5, 6, 6, 6, 5, 4, 3]);
  else rows(c, 3, [2, 3, 4, 5, 5, 5, 5, 4, 3, 2]);
  dots(
    c,
    [
      [C - 2, 4 + s],
      [C - 3, 5 + s],
      [C - 4, 6 + s],
    ],
    Role.Screen,
  );
  dots(c, pick(BUBBLES, f + 2), Role.Accent);
  if (e) eyes(c, 2, 8, 2);
  return c;
};

const PEBBLES = [[[1, 8]], [[2, 4]], [[13, 7]], [[12, 3]]] as const;

const boulder: Draw = (f, e) => {
  const c = createCanvas();
  span(c, 6, C - 2, C + 1);
  span(c, 7, C - 3, C + 3);
  span(c, 8, C - 4, C + 4);
  for (let y = 9; y <= 12; y++) span(c, y, C - 5, C + 5);
  span(c, 13, C - 5, C + 5, Role.Shade);
  dots(
    c,
    [
      [C + 4, 10],
      [C + 3, 11],
      [C + 4, 12],
    ],
    Role.Shade,
  );
  dots(
    c,
    [
      [C, 5],
      [C, 4],
    ],
    Role.Accent,
  );
  const l = f % 2 ? 1 : -1;
  dots(
    c,
    [
      [C + l, 3],
      [C + 2 * l, 3],
      [C - l, 4],
    ],
    Role.Accent,
  );
  if (f === 0) c.paint(C - 2, 8, Role.Screen);
  if (f === 2) c.paint(C - 3, 10, Role.Screen);
  dots(c, pick(PEBBLES, f), Role.Shade);
  if (e) eyes(c, 2, 9, 2);
  return c;
};

const crystal: Draw = (f, e) => {
  const c = createCanvas();
  const w = [2, 3, 4, 4, 4, 3, 3, 2, 2, 1, 1, 0];
  rows(c, 2, w);
  w.forEach((n, i) => {
    for (let x = C + 1; x < C + n; x++) c.paint(x, 2 + i, Role.Shade);
  });
  span(c, 2, C - 1, C + 1, Role.Screen, Role.Shade);
  const glint = pick([[C - 2, 4], [C - 2, 7], [C - 1, 10], null], f);
  if (glint) c.paint(glint[0] as number, glint[1] as number, Role.Screen);
  const bob = sway(f);
  dots(
    c,
    [
      [2, 7 + bob],
      [12, 7 - bob],
    ],
    Role.Accent,
  );
  if (e) eyes(c, 2, 5, 2);
  return c;
};

/** Paints a streak of `len` cells on row `y`, starting at `x0`, kept left of `max`. */
const streak = (c: Canvas, y: number, x0: number, len: number, max: number): void => {
  for (let x = x0; x < x0 + len && x < max; x++) c.paint(x, y, Role.Accent);
};

const puff: Draw = (f, e) => {
  const c = createCanvas();
  const m = C + 1;
  if (f % 2) span(c, 4, m, m + 1);
  const shape = [
    [1, 2],
    [3, 3],
    [4, 4],
    [4, 5],
    [4, 5],
    [3, 4],
    [1, 2],
  ] as const;
  shape.forEach(([l, r], i) => span(c, 5 + i, m - l, m + r));
  streak(c, 6, f % 4, 3, m - 3);
  streak(c, 8, (f + 1) % 4, 2, m - 4);
  streak(c, 10, (f + 2) % 4, 3, m - 3);
  if (e)
    dots(
      c,
      [
        [m - 2, 7],
        [m - 2, 8],
        [m + 2, 7],
        [m + 2, 8],
      ],
      Role.Glow,
    );
  return c;
};

const tornado: Draw = (f, e) => {
  const c = createCanvas();
  const w = [5, 5, 4, 4, 4, 3, 3, 2, 2, 1, 1, 0, 0];
  const shift = (i: number): number => Math.trunc((sway(f) * i) / 6);
  rows(c, 1, w, shift);
  for (const y of [2, 8, 11].map((y) => y + (f % 2))) {
    const i = y - 1;
    const n = w[i] ?? 0;
    if (n > 1) span(c, y, C + shift(i) - n + 1, C + shift(i) + n - 1, Role.Shade, Role.Shade);
  }
  dots(c, pick(EMBERS, f + 2), Role.Accent);
  if (e) eyes(c, 2, 5, 2);
  return c;
};

const STARS = [
  [2, 2, 12, 12],
  [12, 1, 2, 12],
  [12, 2, 1, 13],
  [2, 12, 13, 1],
] as const;

/** Twinkles a plus-shaped star and a single-cell star in the corners. */
const twinkle = (c: Canvas, f: number, role: Role): void => {
  const [px, py, dx, dy] = pick(STARS, f);
  dots(
    c,
    [
      [px, py],
      [px - 1, py],
      [px + 1, py],
      [px, py - 1],
      [px, py + 1],
    ],
    role,
  );
  c.paint(dx, dy, role);
};

const planet: Draw = (f, e) => {
  const c = createCanvas();
  const w = [2, 3, 4, 4, 4, 4, 4, 3, 2];
  rows(c, 3, w, undefined, Role.Body, Role.Body);
  w.forEach((n, i) =>
    dots(
      c,
      [
        [C + n, 3 + i],
        [C + n - 1, 3 + i],
      ],
      Role.Shade,
    ),
  );
  span(c, 7, C - 6, C + 6, Role.Accent, Role.Accent);
  twinkle(c, f, Role.Screen);
  if (e) eyes(c, 2, 5, 2);
  return c;
};

const star: Draw = (f, e) => {
  const c = createCanvas();
  if (f % 2) rows(c, 2, [0, 1, 1, 2, 3, 5, 3, 2, 1, 1, 0], undefined, Role.Body, Role.Body);
  else rows(c, 1, [0, 0, 1, 1, 2, 3, 6, 3, 2, 1, 1, 0, 0], undefined, Role.Body, Role.Body);
  dots(
    c,
    [
      [C + 1, 8],
      [C + 2, 7],
      [C + 1, 9],
      [C, 9],
      [C + 1, 10],
    ],
    Role.Shade,
  );
  if (!e) c.paint(C, 7, Role.Screen);
  twinkle(c, f + 1, Role.Accent);
  if (e) eyes(c, 1, 6, 2);
  return c;
};

/** Every element's two forms on the 15x15 grid. */
export const FULL = { flame, wisp, drop, bubble, boulder, crystal, puff, tornado, planet, star } as const;
