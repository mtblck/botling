import { describe, expect, it } from 'vitest';
import { Role } from '../src/core/types.js';
import { botling } from '../src/styles/botling/index.js';
import { drawGrid } from '../src/styles/noggin/grid/full.js';
import {
  EYES,
  EYEWEAR,
  FACIAL,
  FRAMES,
  GRID_SIZE,
  grid,
  HAIR_COLOURS,
  HAIRS,
  HEADWEAR,
  MOUTHS,
  noggin,
  nogginDataUri,
  PALETTES,
  paletteFor,
  resolveTraits,
  SHAPES,
  SKIN_TONES,
  SMALL_GRID_SIZE,
  smallGrid,
  traits,
} from '../src/styles/noggin/index.js';
import { contrast } from '../src/styles/noggin/palettes.js';

const seeds = Array.from({ length: 400 }, (_, i) => `noggin-${i}`);

describe('noggin', () => {
  it('is stable for a seed, and nearly always differs between seeds', () => {
    expect(noggin('mtblck')).toBe(noggin('mtblck'));
    expect(new Set(seeds.slice(0, 200).map((s) => noggin(s))).size).toBeGreaterThanOrEqual(199);
  });

  it.each(SHAPES)('draws a known seed with %s cells', (shape) => {
    // Noggin is a Preview style: these may change in a minor, but only on purpose.
    expect(noggin('noggin', { shape })).toMatchSnapshot();
  });

  it('salts the seed, so a Noggin shares nothing with its Botling', () => {
    expect(noggin('x')).not.toContain(botling('x').slice(200, 260));
    expect(traits('x')).not.toEqual(traits('y'));
  });

  it('picks every trait from its list, and reaches every hairstyle and skin tone', () => {
    const all = seeds.map((s) => traits(s));
    for (const t of all) {
      expect(HAIRS).toContain(t.hair);
      expect(EYES).toContain(t.eyes);
      expect(MOUTHS).toContain(t.mouth);
      expect(FACIAL).toContain(t.facial);
      expect(EYEWEAR).toContain(t.eyewear);
      expect(HEADWEAR).toContain(t.headwear);
      expect(PALETTES[t.palette]).toBeDefined();
      expect(HAIR_COLOURS[t.hairColour]).toBeDefined();
    }
    expect(new Set(all.map((t) => t.hair)).size).toBe(HAIRS.length);
    expect(new Set(all.map((t) => t.skin)).size).toBe(SKIN_TONES.length);
  });

  it('draws 15x15 and 9x9 grids that stay inside the canvas', () => {
    for (const s of seeds.slice(0, 100)) {
      const t = traits(s);
      expect(grid(t)).toHaveLength(GRID_SIZE);
      expect(smallGrid(t)).toHaveLength(SMALL_GRID_SIZE);
      for (const row of smallGrid(t)) expect(row).toHaveLength(SMALL_GRID_SIZE);
    }
  });

  it('switches to the small Noggin below 40px, and on request', () => {
    expect(noggin('x', { size: 24, shape: 'square' })).toContain('viewBox="-0.5 -0.5 10 10"');
    expect(noggin('x', { size: 96, shape: 'square' })).toContain('viewBox="-0.5 -0.5 16 16"');
    expect(noggin('x', { detail: 'small', shape: 'square' })).toContain('viewBox="-0.5 -0.5 10 10"');
    expect(noggin('x', { size: 24, detail: 'full', shape: 'square' })).toContain('viewBox="-0.5 -0.5 16 16"');
  });

  it('draws every shape and frame at both sizes', () => {
    for (const shape of SHAPES)
      for (const frame of FRAMES)
        for (const size of [24, 96]) expect(noggin(`${shape}-${frame}`, { shape, frame, size })).toMatch(/^<svg /);
  });

  it('applies overrides and the shared options', () => {
    const svg = noggin('x', { size: 40, palette: 2, shape: 'circle', showGrid: false, background: false });
    expect(svg).toContain('width="40" height="40"');
    expect(svg).not.toContain(`fill="${PALETTES[2]?.bg}"`);
    expect(svg).toContain(`"${PALETTES[2]?.screen}"`);
    expect(resolveTraits('x', { palette: 2, shape: 'circle' })).toMatchObject({ palette: 2, shape: 'circle' });
    const custom = { ...paletteFor(0, 0, 0), body: '#123456' };
    expect(noggin('x', { palette: custom })).toContain('#123456');
  });

  it('keeps every face readable: eyes on skin, hair on skin, face on background', () => {
    for (const tone of SKIN_TONES) expect(contrast(tone.glow, tone.body)).toBeGreaterThanOrEqual(2.3);
    for (const s of seeds) {
      const t = traits(s);
      const p = paletteFor(t.palette, t.skin, t.hairColour);
      expect(contrast(p.shade, p.body)).toBeGreaterThanOrEqual(1.8);
      expect(contrast(p.body, p.bg)).toBeGreaterThanOrEqual(1.5);
    }
  });

  it('lets a caller pick the skin tone, and keeps hair and outfit readable on it', () => {
    for (let skin = 0; skin < SKIN_TONES.length; skin++) {
      const t = resolveTraits('x', { skin });
      const p = paletteFor(t.palette, t.skin, t.hairColour);
      expect(t.skin).toBe(skin);
      expect(contrast(p.shade, p.body)).toBeGreaterThanOrEqual(1.8);
      expect(contrast(p.body, p.bg)).toBeGreaterThanOrEqual(1.5);
      expect(noggin('x', { skin })).toContain(`"${SKIN_TONES[skin]?.body}"`);
    }
  });

  it('names the image, or hides it from screen readers', () => {
    expect(noggin('x')).toContain('role="img" aria-label="Person avatar"');
    expect(noggin('x', { title: 'Ada & "co"' })).toContain('aria-label="Ada &#38; &#34;co&#34;"');
    expect(noggin('x', { title: null })).toContain('aria-hidden="true"');
  });

  it('returns a data URI', () => {
    expect(nogginDataUri('x')).toBe(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(noggin('x'))}`);
  });

  it.each([
    [{ shape: 'hexagon' }, 'unknown shape'],
    [{ palette: 6 }, 'palette must be an integer from 0 to 5'],
    [{ skin: 7 }, 'skin must be an integer from 0 to 6'],
    [{ palette: 1.5 }, 'palette must be an integer'],
    [{ palette: null }, 'palette must be an index'],
    [{ palette: { ...paletteFor(0, 0, 0), body: 'red' } }, 'palette.body must be a hex colour'],
    [{ size: 0 }, 'size must be a positive'],
    [{ detail: 'tiny' }, 'unknown detail'],
    [{ frame: 'star' }, 'unknown frame'],
  ])('rejects %j', (opts, message) => {
    expect(() => noggin('x', opts as never)).toThrow(new RegExp(`^noggin: ${message}`));
  });

  it('draws the mouth a row clear of the eyes, so they never join', () => {
    // chrome-piston-108 has tall eyes and a smirk; jolly-spark-867 a wink and a smile.
    for (const seed of ['chrome-piston-108', 'jolly-spark-867']) {
      const c = drawGrid(resolveTraits(seed));
      expect(c.parts.slice(6, 8).flat()).toContain('eyes');
      expect(c.parts.slice(8).flat()).not.toContain('eyes');
      expect(c.parts[9]).toContain('mouth');
    }
  });

  it('draws a wink on the eye row, its closed eye out to the side', () => {
    const c = drawGrid(resolveTraits('jolly-spark-867'));
    for (const dx of [-2, 2, 3]) expect(c.parts[6]?.[c.center + dx]).toBe('eyes');
    expect(c.parts[7]).not.toContain('eyes');
  });

  it('keeps the chin joined to the neck under every mouth', () => {
    // n11 is a narrow head with a smile, whose chin row was all mouth.
    for (const seed of ['n11', ...Array.from({ length: 300 }, (_, i) => `chin-${i}`)]) {
      const c = drawGrid(resolveTraits(seed));
      const chin = c.cells[10]?.filter((role, x) => role !== Role.Empty && c.parts[10]?.[x] !== 'mouth');
      expect(chin?.length, seed).toBeGreaterThanOrEqual(2);
    }
  });
});
