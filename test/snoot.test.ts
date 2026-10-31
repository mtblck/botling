import { describe, expect, it } from 'vitest';
import { botling } from '../src/styles/botling/index.js';
import {
  EXTRAS,
  EYES,
  FRAMES,
  GRID_SIZE,
  grid,
  MARKINGS,
  PALETTES,
  resolveTraits,
  SHAPES,
  SMALL_GRID_SIZE,
  SPECIES,
  smallGrid,
  snoot,
  snootDataUri,
  traits,
} from '../src/styles/snoot/index.js';

const seeds = Array.from({ length: 400 }, (_, i) => `snoot-${i}`);

describe('snoot', () => {
  it('is stable for a seed, and nearly always differs between seeds', () => {
    expect(snoot('mtblck')).toBe(snoot('mtblck'));
    // Snoot has far fewer traits than Botling, so a few seeds in 200 can share an animal.
    expect(new Set(seeds.slice(0, 200).map((s) => snoot(s))).size).toBeGreaterThanOrEqual(195);
  });

  it.each(SHAPES)('draws a known seed with %s cells', (shape) => {
    // Snoot is a Preview style: these may change in a minor, but only on purpose.
    expect(snoot('snoot', { shape })).toMatchSnapshot();
  });

  it('salts the seed, so a Snoot shares nothing with its Botling', () => {
    expect(snoot('x')).not.toContain(botling('x').slice(200, 260));
    expect(traits('x')).not.toEqual(traits('y'));
  });

  it('picks every trait from its list, and reaches every species', () => {
    const all = seeds.map((s) => traits(s));
    for (const t of all) {
      expect(SPECIES).toContain(t.species);
      expect(EYES).toContain(t.eyes);
      expect(MARKINGS).toContain(t.marking);
      expect(EXTRAS).toContain(t.extra);
      expect(PALETTES[t.palette]).toBeDefined();
    }
    expect(new Set(all.map((t) => t.species)).size).toBe(SPECIES.length);
  });

  it('draws 15x15 and 9x9 grids that stay inside the canvas', () => {
    for (const s of seeds.slice(0, 100)) {
      const t = traits(s);
      expect(grid(t)).toHaveLength(GRID_SIZE);
      expect(smallGrid(t)).toHaveLength(SMALL_GRID_SIZE);
      for (const row of smallGrid(t)) expect(row).toHaveLength(SMALL_GRID_SIZE);
    }
  });

  it('switches to the small Snoot below 40px, and on request', () => {
    expect(snoot('x', { size: 24, shape: 'square' })).toContain('viewBox="-0.5 -0.5 10 10"');
    expect(snoot('x', { size: 96, shape: 'square' })).toContain('viewBox="-0.5 -0.5 16 16"');
    expect(snoot('x', { detail: 'small', shape: 'square' })).toContain('viewBox="-0.5 -0.5 10 10"');
    expect(snoot('x', { size: 24, detail: 'full', shape: 'square' })).toContain('viewBox="-0.5 -0.5 16 16"');
  });

  it('draws every species, shape and frame at both sizes', () => {
    for (const shape of SHAPES)
      for (const frame of FRAMES)
        for (const size of [24, 96]) expect(snoot(`${shape}-${frame}`, { shape, frame, size })).toMatch(/^<svg /);
  });

  it('applies overrides and the shared options', () => {
    const svg = snoot('x', { size: 40, palette: 2, shape: 'circle', showGrid: false, background: false });
    expect(svg).toContain('width="40" height="40"');
    expect(svg).not.toContain(`fill="${PALETTES[2]?.bg}"`);
    expect(svg).toContain(`"${PALETTES[2]?.body}"`);
    expect(resolveTraits('x', { palette: 2, shape: 'circle' })).toMatchObject({ palette: 2, shape: 'circle' });
    const custom = { ...PALETTES[0], body: '#123456' } as (typeof PALETTES)[number];
    expect(snoot('x', { palette: custom })).toContain('#123456');
  });

  it('names the image, or hides it from screen readers', () => {
    expect(snoot('x')).toContain('role="img" aria-label="Animal avatar"');
    expect(snoot('x', { title: 'Ada & "co"' })).toContain('aria-label="Ada &#38; &#34;co&#34;"');
    expect(snoot('x', { title: null })).toContain('aria-hidden="true"');
  });

  it('returns a data URI', () => {
    expect(snootDataUri('x')).toBe(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(snoot('x'))}`);
  });

  it.each([
    [{ shape: 'hexagon' }, 'unknown shape'],
    [{ palette: PALETTES.length }, `palette must be an integer from 0 to ${PALETTES.length - 1}`],
    [{ palette: 1.5 }, 'palette must be an integer'],
    [{ palette: null }, 'palette must be an index'],
    [{ palette: { ...PALETTES[0], body: 'red' } }, 'palette.body must be a hex colour'],
    [{ size: 0 }, 'size must be a positive'],
    [{ detail: 'tiny' }, 'unknown detail'],
    [{ frame: 'star' }, 'unknown frame'],
  ])('rejects %j', (opts, message) => {
    expect(() => snoot('x', opts as never)).toThrow(new RegExp(`^snoot: ${message}`));
  });
});
