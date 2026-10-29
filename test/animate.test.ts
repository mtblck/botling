import { describe, expect, it } from 'vitest';
import { drawGrid, drawSmallGrid } from '../src/grid/index.js';
import { botling, CENTER, type Eyes, Role, SHAPES, traits } from '../src/index.js';

/** Cells drawn per colour, counted by subpath, whatever path or group they sit in. */
function cellsByColour(svg: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [, colour, d] of svg.matchAll(/<path (?:fill|stroke)="([^"]+)"[^>]* d="([^"]+)"/g)) {
    out[colour as string] = (out[colour as string] ?? 0) + (d?.match(/m/g) ?? []).length;
  }
  return out;
}

const classes = (svg: string): string[] => [...svg.matchAll(/<g class="([^"]+)"/g)].map(([, c]) => c as string);

/** A seed whose robot has these eyes. */
function seedWith(eyes: Eyes): string {
  for (let i = 0; ; i++) if (traits(`eyes-${i}`).eyes === eyes) return `eyes-${i}`;
}

describe('animate', () => {
  it('leaves the default output alone', () => {
    for (let i = 0; i < 50; i++) {
      expect(botling(`a-${i}`, { animate: false })).toBe(botling(`a-${i}`));
      expect(botling(`a-${i}`)).not.toContain('<style');
    }
  });

  it.each(SHAPES)('draws the same %s cells in the same colours, only regrouped', (shape) => {
    for (let i = 0; i < 50; i++) {
      for (const size of [24, 96]) {
        const still = botling(`a-${i}`, { shape, size });
        expect(cellsByColour(botling(`a-${i}`, { shape, size, animate: true }))).toEqual(cellsByColour(still));
      }
    }
  });

  it('holds still for anyone who prefers reduced motion', () => {
    const svg = botling('mtblck', { animate: true });
    expect(svg).toMatch(/^<svg[^>]*><style>@media \(prefers-reduced-motion:no-preference\)\{.*\}<\/style>/);
    expect(svg.match(/<style>/g)).toHaveLength(1);
  });

  it('only blinks on the small robot', () => {
    for (let i = 0; i < 50; i++) {
      for (const c of classes(botling(`a-${i}`, { animate: true, size: 24 }))) expect(c).toMatch(/^botling-blink-/);
    }
  });

  it('blinks, pulses and flickers on the full robot', () => {
    const seen = new Set(
      Array.from({ length: 50 }, (_, i) => classes(botling(`a-${i}`, { animate: true })))
        .flat()
        .map((c) => c.split('-')[1]),
    );
    expect([...seen].sort()).toEqual(['blink', 'flicker', 'pulse']);
  });

  it('times each seed differently, and the same every time', () => {
    const timing = (seed: string): string => classes(botling(seed, { animate: true, size: 24 })).join();
    expect(timing('mtblck')).toBe(timing('mtblck'));
    expect(new Set(Array.from({ length: 30 }, (_, i) => timing(`t-${i}`))).size).toBeGreaterThan(20);
  });

  it('gives a class the same rule in every robot, so inlined robots cannot clash', () => {
    const rules = new Map<string, string>();
    for (let i = 0; i < 200; i++) {
      for (const [, name, rule] of botling(`r-${i}`, { animate: true }).matchAll(/\.(botling-[\w-]+)\{([^}]+)\}/g)) {
        expect(rules.get(name as string) ?? rule).toBe(rule);
        rules.set(name as string, rule as string);
      }
    }
  });

  it("doesn't blink eyes drawn shut", () => {
    for (const eyes of ['sleepy', 'happy'] as const) {
      const seed = seedWith(eyes);
      expect(botling(seed, { animate: true })).not.toContain('botling-blink');
    }
  });

  it('blinks only the open eye of a wink, and never an angry brow', () => {
    const tagged = (c: ReturnType<typeof drawGrid>): { x: number; role: number }[] =>
      c.parts.flatMap((row, y) =>
        row.flatMap((p, x) => (p === 'eyes' ? [{ x, role: c.cells[y]?.[x] ?? Role.Empty }] : [])),
      );
    const wink = traits(seedWith('wink'));
    for (const cell of tagged(drawGrid(wink))) expect(cell.x).toBeLessThan(CENTER);
    for (const cell of tagged(drawSmallGrid(wink))) expect(cell.x).toBeLessThan(4);
    const angry = traits(seedWith('angry'));
    // The brow is accent; only the glowing eye under it is tagged.
    for (const cell of [...tagged(drawGrid(angry)), ...tagged(drawSmallGrid(angry))]) expect(cell.role).toBe(Role.Glow);
  });

  it('rejects a non-boolean animate', () => {
    // @ts-expect-error: checking the runtime guard for untyped callers
    expect(() => botling('x', { animate: 'yes' })).toThrow(RangeError);
  });

  it('never writes the seed into the SVG', () => {
    expect(botling('user@example.com', { animate: true })).not.toMatch(/user|example/);
  });

  it('adds under a kilobyte', () => {
    for (let i = 0; i < 100; i++) {
      const extra = botling(`b-${i}`, { animate: true }).length - botling(`b-${i}`).length;
      expect(extra).toBeLessThan(1000);
    }
  });
});
