import { describe, expect, it } from 'vitest';
import { HOLIDAY_PALETTES, PALETTES, type Palette } from '../src/styles/botling/index.js';

/** WCAG relative luminance of a #rrggbb colour. */
function luminance(hex: string): number {
  const [r = 0, g = 0, b = 0] = [1, 3, 5].map((i) => {
    const c = Number.parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio, from 1 to 21. */
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

const ALL: [string, Palette][] = [
  ...PALETTES.map((p): [string, Palette] => [p.name, p]),
  ...Object.values(HOLIDAY_PALETTES).map((p): [string, Palette] => [p.name, p]),
];

// Floors set with Matt before 1.0 (#35), so a new palette can't fall below
// today's weakest. The outline sits at about WCAG's 3:1 for graphics (Ember
// is 2.98). A face without a screen is cut out of the body, and Night shift
// keeps its soft one (2.3) by choice.
describe.each(ALL)('%s palette', (_, p) => {
  it('lights the face clearly on its screen', () => {
    expect(contrast(p.glow, p.screen)).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps a face visible on robots without a screen', () => {
    expect(contrast(p.screen, p.body)).toBeGreaterThanOrEqual(2.3);
  });

  it('separates the robot from its tile, by its body or its edge', () => {
    expect(Math.max(contrast(p.body, p.bg), contrast(p.shade, p.bg))).toBeGreaterThanOrEqual(2.95);
  });

  it('uses six-digit hex colours', () => {
    for (const colour of [p.bg, p.grid, p.body, p.shade, p.screen, p.glow, p.accent]) {
      expect(colour).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});
