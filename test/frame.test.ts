import { describe, expect, it } from 'vitest';
import { botling, FRAMES, grid, SHAPES, smallGrid, traits } from '../src/index.js';
import { outline, padding } from '../src/render/cell.js';
import { contains, frameFit } from '../src/render/frame.js';
import type { Shape } from '../src/types.js';

/** Corners that bound a drawn robot cell, in grid units: its box, and a triangle's or diamond's overhang. */
const bounds = (shape: Shape, x: number, y: number, isSmall: boolean): [number, number][] => [
  [x, y],
  [x + 1, y],
  [x, y + 1],
  [x + 1, y + 1],
  ...outline(shape, x, y, isSmall).map(([px, py]): [number, number] => [px / 1000, py / 1000]),
];

/** The smallest scale, in hundredths, at which every robot in `seeds` fits a frame while hovering. */
function tightest(frame: 'squircle' | 'rounded', isSmall: boolean, seeds: number): number {
  const n = isSmall ? 9 : 15;
  let worst = 1;
  for (let i = 0; i < seeds; i++) {
    for (const shape of SHAPES) {
      const t = { ...traits(`fit-${i}`), shape };
      const half = n / 2 + padding(shape);
      const cells = isSmall ? smallGrid(t) : grid(t);
      for (const [y, row] of cells.entries()) {
        for (const [x, role] of row.entries()) {
          if (!role) continue;
          for (const [px, py] of bounds(shape, x, y, isSmall)) {
            for (const lift of [0, 0.4]) {
              let k = 1;
              while (!contains(frame, ((px - n / 2) * k) / half, ((py - lift - n / 2) * k) / half)) k -= 0.0025;
              worst = Math.min(worst, k);
            }
          }
        }
      }
    }
  }
  return worst;
}

describe('frame', () => {
  it("draws today's square by default", () => {
    for (const size of [24, 96]) expect(botling('frame', { size, frame: 'square' })).toBe(botling('frame', { size }));
  });

  it.each(FRAMES.filter((f) => f !== 'square'))('pins the %s output for a known seed', (frame) => {
    expect(botling('botling', { frame })).toMatchSnapshot();
    expect(botling('botling', { frame, size: 24, animate: true })).toMatchSnapshot();
  });

  it('rejects an unknown frame', () => {
    expect(() => botling('x', { frame: 'hexagon' as never })).toThrow(RangeError);
  });

  it('fits every robot inside a squircle, hovering included', () => {
    const scale = frameFit('squircle', 'square', 15, 0.5).scale;
    expect(tightest('squircle', false, 500)).toBeGreaterThanOrEqual(scale);
    expect(tightest('squircle', true, 500)).toBeGreaterThanOrEqual(scale);
  });

  it('crops at most a sliver of a robot in a rounded frame', () => {
    expect(tightest('rounded', false, 500)).toBe(1);
    expect(tightest('rounded', true, 500)).toBeGreaterThan(0.97);
  });

  it('clips to the frame with an id named by its geometry, so inlined robots share it', () => {
    const a = botling('a', { frame: 'circle', shape: 'square' });
    const b = botling('b', { frame: 'circle', shape: 'square' });
    const id = (svg: string): string | undefined => svg.match(/<clipPath id="([^"]+)"/)?.[1];
    expect(id(a)).toBe('botling-circle-500-16000');
    expect(id(b)).toBe(id(a));
    expect(id(botling('a', { frame: 'circle', shape: 'triangle' }))).not.toBe(id(a));
    expect(a).toContain('clip-path="url(#botling-circle-500-16000)"');
  });

  it('leaves the corners transparent and drops the fill without a background', () => {
    const svg = botling('bg', { frame: 'circle', palette: 3 });
    expect(svg).toContain('<circle cx="7.5" cy="7.5" r="8" fill=');
    expect(botling('bg', { frame: 'circle', background: false })).not.toMatch(/<circle[^>]*fill=/);
  });

  it('keeps only the grid cells inside the frame', () => {
    const cells = (svg: string): number => (svg.match(/m/g) ?? []).length;
    for (const shape of SHAPES) {
      const square = cells(botling('g', { shape }));
      expect(cells(botling('g', { shape, frame: 'circle' }))).toBeLessThan(square);
      expect(cells(botling('g', { shape, frame: 'rounded' }))).toBeLessThan(square);
      // Every corner cell of a 15x15 grid lies outside a circle.
      const fit = frameFit('circle', shape, 15, padding(shape));
      for (const [x, y] of [
        [0, 0],
        [14, 0],
        [0, 14],
        [14, 14],
      ] as const)
        expect(fit.holds(x, y)).toBe(false);
      expect(fit.holds(7, 0)).toBe(true);
    }
  });

  it('fills a squircle past the 15x15 grid where the shrunk robot leaves room', () => {
    const fit = frameFit('squircle', 'square', 15, 0.5);
    expect(fit.reach).toBeGreaterThan(0);
    expect(fit.holds(7, -1)).toBe(true);
  });
});
