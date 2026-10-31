import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  ACCESSORIES,
  botling,
  EYES,
  grid,
  HEADS,
  MOUTHS,
  PALETTES,
  PATTERNS,
  QUIRKS,
  Role,
  type RoleGrid,
  resolveTraits,
  SHAPES,
  SIDES,
  smallGrid,
  TOPS,
  type Traits,
} from '../src/styles/botling/index.js';

// The 1.0 freeze (ADR 0006), checked over many seeds rather than one. A
// change to a digest below means existing users get a different robot: a
// major version. Picture (layout and colours) and markup are pinned apart,
// so SVG that draws the same picture (allowed in a minor) only moves the
// markup digests. Cell geometry lives in the markup, so a change there moves
// only the markup digests too: look at the preview before calling it minor.
const SEEDS = Array.from({ length: 500 }, (_, i) => `corpus-${i}`);

const digest = (parts: Iterable<string>): string => {
  const h = createHash('sha256');
  for (const part of parts) h.update(part).update('\n');
  return h.digest('hex').slice(0, 16);
};

/** One robot as drawn: each cell's colour, row by row. */
function picture(t: Traits, cells: RoleGrid): string {
  const p = PALETTES[t.palette];
  if (!p) throw new Error(`no palette ${t.palette}`);
  const colour: Record<Role, string> = {
    [Role.Empty]: '-',
    [Role.Body]: p.body,
    [Role.Screen]: p.screen,
    [Role.Glow]: t.hasScreen ? p.glow : p.screen,
    [Role.Accent]: p.accent,
    [Role.Shade]: p.shade,
  };
  return `${p.bg} ${cells.map((row) => row.map((r) => colour[r]).join(' ')).join('/')}`;
}

describe('golden corpus', () => {
  it.each(SHAPES)('pins the %s pictures', (shape) => {
    const robots = SEEDS.map((seed) => resolveTraits(seed, { shape }));
    expect({
      full: digest(robots.map((t) => picture(t, grid(t)))),
      small: digest(robots.map((t) => picture(t, smallGrid(t)))),
    }).toMatchSnapshot();
  });

  it.each(SHAPES)('pins the %s markup, still and animated', (shape) => {
    const svg = (size: number, animate: boolean): string =>
      digest(SEEDS.map((seed) => botling(seed, { shape, size, animate })));
    expect({
      full: svg(96, false),
      small: svg(24, false),
      fullAnimated: svg(96, true),
      smallAnimated: svg(24, true),
    }).toMatchSnapshot();
  });

  it('pins the traits of every seed', () => {
    expect(digest(SEEDS.map((seed) => JSON.stringify(resolveTraits(seed))))).toMatchSnapshot();
  });

  it.each([
    ['palette', PALETTES.map((_, i) => i)],
    ['head', HEADS],
    ['eyes', EYES],
    ['mouth', MOUTHS],
    ['top', TOPS],
    ['sides', SIDES],
    ['shape', SHAPES],
    ['pattern', PATTERNS],
    ['quirk', QUIRKS],
    ['accessory', ACCESSORIES],
  ] as const)('reaches every %s, so no part goes unpinned', (key, values) => {
    const seen = new Set(SEEDS.map((seed) => resolveTraits(seed)[key]));
    expect([...seen].sort()).toEqual([...values].sort());
  });
});
