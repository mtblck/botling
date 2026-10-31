import { describe, expect, it } from 'vitest';
import { drawGrid, drawSmallGrid } from '../src/styles/botling/grid/index.js';
import { botling, CENTER, type Eyes, PALETTES, Role, SHAPES, traits } from '../src/styles/botling/index.js';
import { stillFrame } from './still-frame.js';

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

  it.each(SHAPES)('draws the same %s robot when nothing moves', (shape) => {
    for (let i = 0; i < 50; i++) {
      for (const size of [24, 96]) {
        const still = stillFrame(botling(`a-${i}`, { shape, size }));
        expect(stillFrame(botling(`a-${i}`, { shape, size, animate: true }))).toEqual(still);
      }
    }
  });

  it('holds still for anyone who prefers reduced motion', () => {
    const svg = botling('mtblck', { animate: true });
    expect(svg).toMatch(/^<svg[^>]*><style>@media \(prefers-reduced-motion:no-preference\)\{.*\}<\/style>/);
    expect(svg.match(/<style>/g)).toHaveLength(1);
  });

  it('only blinks and hovers on the small robot', () => {
    for (let i = 0; i < 50; i++) {
      for (const c of classes(botling(`a-${i}`, { animate: true, size: 24 })))
        expect(c).toMatch(/^botling-(blink2?|hover)-/);
    }
  });

  it('uses every motion on the full robot', () => {
    const seen = new Set(
      Array.from({ length: 50 }, (_, i) => classes(botling(`a-${i}`, { animate: true })))
        .flat()
        .map((c) => c.split('-')[1]),
    );
    expect([...seen].sort()).toEqual(['blink', 'blink2', 'hover', 'scan', 'talk', 'twitch', 'wobble', 'wobbler']);
  });

  it('moves every robot, screen or not', () => {
    for (let i = 0; i < 200; i++) {
      for (const size of [24, 96]) {
        const moving = classes(botling(`m-${i}`, { animate: true, size }));
        expect(moving.some((c) => c.startsWith('botling-hover-'))).toBe(true);
      }
    }
  });

  it('puts a lid under blinking eyes, so a robot without a screen visibly blinks', () => {
    const seed = Array.from({ length: 500 }, (_, i) => `l-${i}`).find((s) => {
      const t = traits(s);
      return !t.hasScreen && t.eyes === 'dot' && t.accessory === 'none';
    }) as string;
    const t = traits(seed);
    const svg = botling(seed, { animate: true, shape: 'square', palette: t.palette });
    const body = new RegExp(`fill="${PALETTES[t.palette]?.body}"`, 'g');
    // The body path gains the two eye cells as lids, beneath the blinking eyes.
    const still = botling(seed, { shape: 'square', palette: t.palette });
    const count = (s: string): number => s.match(body)?.length ?? 0;
    expect(count(svg)).toBeGreaterThanOrEqual(count(still));
    expect(stillFrame(svg)).toEqual(stillFrame(still));
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

  it("doesn't blink eyes drawn shut, but blinks happy ones", () => {
    expect(botling(seedWith('sleepy'), { animate: true })).not.toContain('botling-blink');
    expect(botling(seedWith('happy'), { animate: true })).toMatch(/botling-blink2?-/);
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

  it('adds about 2.4 KB at full size and half a kilobyte small', () => {
    for (let i = 0; i < 100; i++) {
      expect(botling(`b-${i}`, { animate: true }).length - botling(`b-${i}`).length).toBeLessThan(4500);
      expect(
        botling(`b-${i}`, { animate: true, size: 24 }).length - botling(`b-${i}`, { size: 24 }).length,
      ).toBeLessThan(900);
    }
  });
});
