import { describe, expect, it } from 'vitest';
import { encodeGif } from '../site/gif.js';
import { frameAt, loopLength, periods } from '../site/motion.js';
import { botling } from '../src/index.js';

interface Decoded {
  width: number;
  height: number;
  loops: boolean;
  /** Each frame composited as RGBA, with its delay in hundredths of a second. */
  frames: { rgba: Uint8ClampedArray; delay: number }[];
}

/** A small GIF decoder: just what encodeGif writes, checked independently of it. */
function decode(gif: Uint8Array): Decoded {
  let p = 0;
  const word = (): number => (gif[p++] ?? 0) | ((gif[p++] ?? 0) << 8);
  expect(String.fromCharCode(...gif.subarray(0, 6))).toBe('GIF89a');
  p = 6;
  const width = word();
  const height = word();
  const packed = gif[p] ?? 0;
  p += 3;
  const table = gif.subarray(p, p + 3 * (2 << (packed & 7)));
  p += table.length;
  const canvas = new Uint8ClampedArray(width * height * 4);
  const out: Decoded = { width, height, loops: false, frames: [] };
  let delay = 0;
  let clear = -1;
  for (;;) {
    const kind = gif[p++];
    if (kind === 0x3b) return out;
    if (kind === 0x21) {
      const label = gif[p++];
      if (label === 0xf9) {
        clear = (gif[p + 1] ?? 0) & 1 ? (gif[p + 4] ?? 0) : -1;
        p += 2;
        delay = word();
        p -= 4;
      }
      if (label === 0xff) out.loops = true;
      while (gif[p] !== 0) p += (gif[p] ?? 0) + 1;
      p++;
      continue;
    }
    expect(kind).toBe(0x2c);
    const [x, y, w, h] = [word(), word(), word(), word()];
    p++;
    const minSize = gif[p++] ?? 0;
    const data: number[] = [];
    while (gif[p] !== 0) {
      const n = gif[p++] ?? 0;
      data.push(...gif.subarray(p, p + n));
      p += n;
    }
    p++;
    const pixels = lzwDecode(data, minSize, w * h);
    for (const [i, v] of pixels.entries()) {
      if (v === clear) continue;
      const o = ((y + Math.floor(i / w)) * width + x + (i % w)) * 4;
      canvas.set([table[v * 3] ?? 0, table[v * 3 + 1] ?? 0, table[v * 3 + 2] ?? 0, 255], o);
    }
    out.frames.push({ rgba: canvas.slice(), delay });
  }
}

function lzwDecode(data: number[], minSize: number, count: number): number[] {
  const CLEAR = 1 << minSize;
  let dict: number[][] = [];
  const reset = (): void => {
    dict = Array.from({ length: CLEAR + 2 }, (_, i) => [i]);
  };
  reset();
  let size = minSize + 1;
  let pos = 0;
  let prev: number[] | null = null;
  const out: number[] = [];
  while (out.length < count) {
    let code = 0;
    for (let b = 0; b < size; b++, pos++) code |= (((data[pos >> 3] ?? 0) >> (pos & 7)) & 1) << b;
    if (code === CLEAR) {
      reset();
      size = minSize + 1;
      prev = null;
      continue;
    }
    if (code === CLEAR + 1) break;
    const entry: number[] = dict[code] ?? (prev ? [...prev, prev[0] ?? 0] : []);
    out.push(...entry);
    if (prev && dict.length < 4096) dict.push([...prev, entry[0] ?? 0]);
    if (dict.length === 1 << size && size < 12) size++;
    prev = entry;
  }
  return out;
}

/** A width x height frame, every pixel from colour(x, y). */
const frame = (w: number, h: number, colour: (x: number, y: number) => number[]): Uint8ClampedArray =>
  Uint8ClampedArray.from({ length: w * h * 4 }, (_, i) => colour((i >> 2) % w, Math.floor((i >> 2) / w))[i % 4] ?? 0);

describe('GIF encoder', () => {
  it('round-trips a still frame exactly', () => {
    const f = frame(7, 5, (x, y) => [x * 30, y * 50, (x * y) % 255, 255]);
    const out = decode(encodeGif([f], 7, 5, 5));
    expect(out).toMatchObject({ width: 7, height: 5, loops: false });
    expect(out.frames.map((d) => d.rgba)).toEqual([f]);
  });

  it('keeps see-through corners and loops an animation, merging repeated frames', () => {
    const at = (shift: number): Uint8ClampedArray =>
      frame(40, 40, (x, y) =>
        (x < 4 && y < 4) || x > 36 ? [0, 0, 0, 0] : [((x + shift) % 8) * 30, (y % 8) * 30, 90, 255],
      );
    const frames = [at(0), at(1), at(1), at(2)];
    const out = decode(encodeGif(frames, 40, 40, 5));
    expect(out.loops).toBe(true);
    expect(out.frames.map((d) => d.delay)).toEqual([5, 10, 5]);
    expect(out.frames.map((d) => d.rgba)).toEqual([frames[0], frames[1], frames[3]]);
  });

  it('runs past 4096 codes, where LZW starts its table again', () => {
    const f = frame(200, 200, (x, y) => [(x * 7919 + y * 104729) % 251, 0, 0, 255]);
    expect(decode(encodeGif([f], 200, 200, 5)).frames[0]?.rgba).toEqual(f);
  });

  it('maps colours past the 256th to the nearest one kept', () => {
    const f = frame(30, 30, (x, y) => (x < 29 ? [x, y, 0, 255] : [x - 28, y, 1, 255]));
    const [d] = decode(encodeGif([f], 30, 30, 5)).frames;
    // 870 common colours from x < 29 crowd out the column at x = 29, which takes its neighbour's colour.
    expect(Math.abs((d?.rgba[(5 * 30 + 29) * 4] ?? 99) - 1)).toBeLessThanOrEqual(1);
  });
});

describe('GIF frames', () => {
  const svg = botling('jolly-sprocket-65', { animate: true, size: 64 });

  it('finds every motion and a loop between 6 and 10 seconds', () => {
    const list = periods(svg);
    expect(list.length).toBeGreaterThan(2);
    expect(loopLength(list)).toBeGreaterThanOrEqual(6);
    expect(loopLength(list)).toBeLessThanOrEqual(10);
    expect(periods(botling('jolly-sprocket-65'))).toEqual([]);
    expect(loopLength([])).toBe(0);
  });

  it('pauses every animation, fitted to the loop, whatever the reduced-motion setting', () => {
    const loop = loopLength(periods(svg));
    const still = frameAt(svg, loop, 1.25);
    expect(still).not.toContain('prefers-reduced-motion');
    const rules = [...still.matchAll(/animation:botling-[a-z0-9]+ ([\d.]+)s (-?[\d.]+)s[^;}]* infinite paused/g)];
    expect(rules).toHaveLength(periods(svg).length);
    for (const [, period, delay] of rules) {
      expect((loop / Number(period)) % 1).toBeCloseTo(0, 6);
      expect(-Number(delay)).toBeGreaterThanOrEqual(0);
      expect(-Number(delay)).toBeLessThan(Number(period));
    }
  });

  it('comes back to the first frame after one loop', () => {
    const loop = loopLength(periods(svg));
    const delays = (s: string): number[] => [...s.matchAll(/s (-?[\d.]+)s/g)].map((m) => Number(m[1]));
    const [a, b] = [delays(frameAt(svg, loop, 0)), delays(frameAt(svg, loop, loop))];
    for (const [i, d] of a.entries()) expect(d).toBeCloseTo(b[i] ?? Number.NaN, 3);
  });
});
