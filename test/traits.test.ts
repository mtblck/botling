import { describe, expect, it } from 'vitest';
import {
  ACCESSORIES,
  EYES,
  HEADS,
  MOUTHS,
  PALETTES,
  PATTERNS,
  QUIRKS,
  SHAPES,
  SIDES,
  TOPS,
  traits,
} from '../src/index.js';

const SAMPLE = Array.from({ length: 3000 }, (_, i) => traits(`user-${i}`));

describe('traits', () => {
  it('is stable for a seed', () => {
    expect(traits('mtblck')).toEqual(traits('mtblck'));
  });

  it('pins the traits for a known seed', () => {
    // Changing this means existing users get a different robot: a major version.
    expect(traits('botling')).toMatchSnapshot();
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
  ] as const)('reaches every %s', (key, values) => {
    const seen = new Set(SAMPLE.map((t) => t[key]));
    expect([...seen].sort()).toEqual([...values].sort());
  });

  it('leaves most robots plain, so the extras stay a surprise', () => {
    const share = (pred: (t: (typeof SAMPLE)[number]) => boolean): number => SAMPLE.filter(pred).length / SAMPLE.length;
    expect(share((t) => t.pattern === 'none')).toBeCloseTo(0.65, 1);
    expect(share((t) => t.quirk === 'none')).toBeCloseTo(0.75, 1);
    expect(share((t) => t.accessory === 'none')).toBeCloseTo(0.75, 1);
  });

  it('keeps sizes in range', () => {
    for (const t of SAMPLE) {
      expect(t.halfWidth).toBeGreaterThanOrEqual(3);
      expect(t.halfWidth).toBeLessThanOrEqual(5);
      expect(t.topRow).toBeGreaterThanOrEqual(3);
      expect(t.bottomRow).toBeLessThanOrEqual(12);
      expect(t.eyeGap).toBeGreaterThanOrEqual(1);
    }
  });
});
