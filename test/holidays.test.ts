import { describe, expect, it } from 'vitest';
import { botling, HOLIDAY_PALETTES, PALETTES, resolveTraits } from '../src/styles/botling/index.js';
import type { Palette } from '../src/styles/botling/types.js';

const holidays = Object.entries(HOLIDAY_PALETTES);
const fills = (svg: string): Set<string> => new Set([...svg.matchAll(/fill="([^"]+)"/g)].map((m) => m[1] as string));

describe('holiday palettes', () => {
  it.each(holidays)('%s paints only its own colours', (_, palette) => {
    const allowed = new Set(Object.values(palette));
    for (const seed of ['a', 'b', 'mtblck', 'botcollector']) {
      for (const used of fills(botling(seed, { palette }))) expect(allowed).toContain(used);
    }
  });

  it('keeps the seed robot, only recoloured', () => {
    const shape = (svg: string): string => svg.replace(/fill="[^"]+"/g, '');
    const seeded = botling('mtblck');
    expect(shape(botling('mtblck', { palette: HOLIDAY_PALETTES.halloween }))).toBe(shape(seeded));
  });

  it('is never picked by a seed', () => {
    const names = new Set(PALETTES.map((p) => p.name));
    for (const p of Object.values(HOLIDAY_PALETTES)) expect(names).not.toContain(p.name);
    expect(resolveTraits('x', { palette: HOLIDAY_PALETTES.christmas }).palette).toBe(resolveTraits('x').palette);
  });

  it('gives Halloween colours of its own, not Ember with a new name', () => {
    const ember = PALETTES.find((p) => p.name === 'Ember') as Palette;
    const { halloween } = HOLIDAY_PALETTES;
    expect([halloween.body, halloween.glow, halloween.accent, halloween.bg]).not.toContain(ember.body);
    expect(halloween.glow).not.toBe(ember.glow);
  });
});

describe('palette objects', () => {
  const custom: Palette = { ...HOLIDAY_PALETTES.christmas, body: '#123456' };

  it('accepts your own hex palette', () => {
    expect(botling('x', { palette: custom })).toContain('#123456');
  });

  it.each([
    ['a non-hex colour', { ...custom, body: 'red' }],
    ['markup', { ...custom, glow: '"/><script>alert(1)</script>' }],
    ['a missing colour', { ...custom, accent: undefined }],
  ])('rejects %s', (_, palette) => {
    expect(() => botling('x', { palette: palette as unknown as Palette })).toThrow(RangeError);
  });

  it('rejects null', () => {
    expect(() => botling('x', { palette: null as unknown as Palette })).toThrow(RangeError);
  });
});

describe('palette hardening', () => {
  it('reads each colour once, so a getter cannot swap in markup after the check', () => {
    let reads = 0;
    const tricky = {
      ...HOLIDAY_PALETTES.christmas,
      get body() {
        reads++;
        return reads > 1 ? '"/><script>alert(1)</script>' : '#123456';
      },
    };
    const svg = botling('x', { palette: tricky });
    expect(svg).not.toContain('<script');
    expect(reads).toBe(1);
  });

  it('cannot be recoloured at runtime', () => {
    expect(Object.isFrozen(HOLIDAY_PALETTES.halloween)).toBe(true);
    expect(PALETTES.every((p) => Object.isFrozen(p))).toBe(true);
  });

  it('names the problem for null or an array', () => {
    expect(() => botling('x', { palette: [] as unknown as Palette })).toThrow(
      /index into PALETTES or a palette object/,
    );
  });
});
