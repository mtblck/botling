import { inflateSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { HEIGHT, ogImage, WIDTH } from '../scripts/og.mjs';
import * as lib from '../src/styles/botling/index.js';

/** The PNG's size and its RGB rows, read back from the one IDAT chunk ogImage writes. */
function decode(png: Buffer): { width: number; height: number; at: (x: number, y: number) => string } {
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  const idat = png.indexOf('IDAT');
  const raw = inflateSync(png.subarray(idat + 4, idat + 4 + png.readUInt32BE(idat - 4)));
  const at = (x: number, y: number): string => {
    const i = y * (width * 3 + 1) + 1 + x * 3;
    return `#${[...raw.subarray(i, i + 3)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
  };
  return { width, height, at };
}

describe('link preview image', () => {
  const png = ogImage(lib);
  const { width, height, at } = decode(png);

  it('is a 1200x630 PNG, small enough for chat apps to fetch', () => {
    expect(png.subarray(0, 8)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    expect([width, height]).toEqual([WIDTH, HEIGHT]);
    expect(png.length).toBeLessThan(100_000);
  });

  it('draws the logo robot in the middle, on its Ice tile', () => {
    const ice = lib.PALETTES.find((p) => p.name === 'Ice');
    expect(at(5, 5)).toBe('#f6f3ec');
    expect(at(470, 120)).toBe(ice?.bg);
    const colours = new Set<string>();
    for (let y = 100; y < 400; y += 3) for (let x = 450; x < 750; x += 3) colours.add(at(x, y));
    expect(colours).toContain(ice?.body);
  });
});
