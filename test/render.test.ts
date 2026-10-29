import { describe, expect, it } from 'vitest';
import { botling, botlingDataUri, PALETTES, resolveTraits, SHAPES } from '../src/index.js';

describe('botling', () => {
  it('is stable for a seed', () => {
    expect(botling('mtblck')).toBe(botling('mtblck'));
  });

  it.each(SHAPES)('pins the %s output for a known seed', (shape) => {
    // Changing these means existing users get a different robot: a major version.
    expect(botling('botling', { shape })).toMatchSnapshot();
  });

  it('differs between seeds', () => {
    const svgs = new Set(Array.from({ length: 200 }, (_, i) => botling(`user-${i}`)));
    expect(svgs.size).toBe(200);
  });

  it('applies size, palette and shape overrides', () => {
    const svg = botling('x', { size: 40, palette: 6, shape: 'circle' });
    expect(svg).toContain('width="40" height="40"');
    expect(svg).toContain(`fill="${PALETTES[6]?.bg}"`);
    expect(svg).toContain('stroke-linecap="round"');
    expect(svg).not.toContain('stroke-linejoin');
  });

  it('hides the empty grid below 40px unless asked', () => {
    // Each cell starts a subpath with `m`.
    const cells = (svg: string): number =>
      [...svg.matchAll(/ d="([^"]+)"/g)].reduce((n, [, d]) => n + (d?.match(/m/g) ?? []).length, 0);
    const opts = { shape: 'circle', detail: 'full' } as const;
    expect(cells(botling('g', { ...opts, size: 24 }))).toBeLessThan(cells(botling('g', { ...opts, size: 48 })));
    expect(cells(botling('g', { ...opts, size: 24, showGrid: true }))).toBe(cells(botling('g', { ...opts, size: 48 })));
    expect(cells(botling('g', { ...opts, size: 96, showGrid: false }))).toBe(
      cells(botling('g', { ...opts, size: 24 })),
    );
  });

  it('draws the small robot below 40px and the full robot from 40px', () => {
    const viewBox = (svg: string): string | undefined => svg.match(/viewBox="([^"]+)"/)?.[1];
    expect(viewBox(botling('d', { shape: 'square', size: 39 }))).toBe('-0.5 -0.5 10 10');
    expect(viewBox(botling('d', { shape: 'square', size: 40 }))).toBe('-0.5 -0.5 16 16');
    expect(viewBox(botling('d', { shape: 'square', size: 96, detail: 'small' }))).toBe('-0.5 -0.5 10 10');
    expect(viewBox(botling('d', { shape: 'square', size: 24, detail: 'full' }))).toBe('-0.5 -0.5 16 16');
  });

  it('never draws the empty grid on the small robot', () => {
    const t = resolveTraits('s');
    const grid = PALETTES[t.palette]?.grid;
    expect(botling('s', { detail: 'small', showGrid: true })).not.toContain(`fill="${grid}"`);
  });

  it.each(SHAPES)('pins the small %s output for a known seed', (shape) => {
    expect(botling('botling', { shape, size: 24 })).toMatchSnapshot();
  });

  it('drops the background when asked', () => {
    const p = PALETTES[resolveTraits('bg').palette];
    expect(botling('bg')).toContain(`fill="${p?.bg}"`);
    expect(botling('bg', { background: false })).not.toContain(`fill="${p?.bg}"`);
  });

  it('escapes the title and supports decorative images', () => {
    expect(botling('t', { title: 'Tom & "Jerry" <3' })).toContain('aria-label="Tom &#38; &#34;Jerry&#34; &#60;3"');
    const hidden = botling('t', { title: null });
    expect(hidden).toContain('aria-hidden="true"');
    expect(hidden).not.toContain('role="img"');
  });

  it('rejects bad options instead of drawing nothing', () => {
    expect(() => botling('x', { palette: PALETTES.length })).toThrow(RangeError);
    expect(() => botling('x', { palette: 1.5 })).toThrow(RangeError);
    // @ts-expect-error: checking the runtime guard for untyped callers
    expect(() => botling('x', { shape: 'hexagon' })).toThrow(RangeError);
    expect(() => botling('x', { size: 0 })).toThrow(RangeError);
    // @ts-expect-error: checking the runtime guard for untyped callers
    expect(() => botling('x', { detail: 'tiny' })).toThrow(RangeError);
    expect(() => botling('x', { size: Number.POSITIVE_INFINITY })).toThrow(RangeError);
    // @ts-expect-error: a string size could break out of the width attribute
    expect(() => botling('x', { size: '96" onload="x' })).toThrow(RangeError);
  });

  it('only draws colours from the chosen palette', () => {
    for (let i = 0; i < 100; i++) {
      const t = resolveTraits(`c-${i}`);
      const allowed = new Set(Object.values(PALETTES[t.palette] ?? {}));
      for (const [, colour] of botling(`c-${i}`).matchAll(/(?:fill|stroke)="(#[^"]+)"/g))
        expect(allowed).toContain(colour);
    }
  });
});

it.each(SHAPES)('keeps %s robots within the size budget', (shape) => {
  // About a third of the per-cell-element output; a jump means a cell got longer.
  for (let i = 0; i < 100; i++) {
    expect(botling(`b-${i}`, { shape }).length).toBeLessThan(7500);
    expect(botling(`b-${i}`, { shape, size: 24 }).length).toBeLessThan(2600);
  }
});

it('never writes the seed into the SVG', () => {
  expect(botling('user@example.com')).not.toMatch(/user|example/);
});

it('treats a numeric seed like its string form', () => {
  // @ts-expect-error: untyped callers may pass a number
  expect(botling(42)).toBe(botling('42'));
});

describe('botlingDataUri', () => {
  it('encodes the same SVG as botling', () => {
    const uri = botlingDataUri('uri', { size: 32 });
    expect(uri.startsWith('data:image/svg+xml;charset=utf-8,')).toBe(true);
    expect(decodeURIComponent(uri.split(',')[1] ?? '')).toBe(botling('uri', { size: 32 }));
  });
});
