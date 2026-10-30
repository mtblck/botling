// A small GIF encoder for the playground's GIF download: no dependency, and pure, so
// test/gif.test.ts can decode what it writes. Robots are flat colour, so a palette of
// the 256 commonest colours (anti-aliased edges take the nearest) loses nothing visible.

/** A Uint8Array that grows as bytes are written. */
class Bytes {
  buf = new Uint8Array(1 << 16);
  length = 0;
  /** @param {...number} bytes */
  push(...bytes) {
    for (const b of bytes) {
      if (this.length === this.buf.length) {
        const next = new Uint8Array(this.buf.length * 2);
        next.set(this.buf);
        this.buf = next;
      }
      this.buf[this.length++] = b;
    }
  }
  /** @param {number} n - A 16-bit number, little-endian */
  word(n) {
    this.push(n & 0xff, (n >> 8) & 0xff);
  }
  done() {
    return this.buf.slice(0, this.length);
  }
}

/**
 * One palette for every frame: the commonest opaque colours, with one slot kept for
 * transparency when any pixel is see-through (a round frame's corners).
 */
function palette(frames) {
  const counts = new Map();
  let hasClear = false;
  for (const f of frames) {
    for (let i = 0; i < f.length; i += 4) {
      if (f[i + 3] < 128) hasClear = true;
      else {
        const c = (f[i] << 16) | (f[i + 1] << 8) | f[i + 2];
        counts.set(c, (counts.get(c) ?? 0) + 1);
      }
    }
  }
  const colours = [...counts.keys()].sort((a, b) => counts.get(b) - counts.get(a)).slice(0, hasClear ? 255 : 256);
  return { colours, clear: hasClear ? colours.length : -1 };
}

/** Each frame as palette indices, with colours outside the palette taking the nearest. */
function index(frames, { colours, clear }) {
  const lookup = new Map(colours.map((c, i) => [c, i]));
  const nearest = (c) => {
    let best = 0;
    let bestD = Infinity;
    for (const [i, p] of colours.entries()) {
      const d =
        ((c >> 16) - (p >> 16)) ** 2 + (((c >> 8) & 255) - ((p >> 8) & 255)) ** 2 + ((c & 255) - (p & 255)) ** 2;
      if (d < bestD) [best, bestD] = [i, d];
    }
    lookup.set(c, best);
    return best;
  };
  return frames.map((f) => {
    const out = new Uint8Array(f.length / 4);
    for (let i = 0; i < out.length; i++) {
      const j = i * 4;
      if (f[j + 3] < 128) out[i] = clear;
      else {
        const c = (f[j] << 16) | (f[j + 1] << 8) | f[j + 2];
        out[i] = lookup.get(c) ?? nearest(c);
      }
    }
    return out;
  });
}

/** The smallest rectangle holding every pixel that differs between two frames, or null. */
function changed(a, b, width) {
  let [x0, y0, x1, y1] = [Infinity, Infinity, -1, -1];
  for (let i = 0; i < a.length; i++) {
    if (a[i] === b[i]) continue;
    const x = i % width;
    const y = (i - x) / width;
    x0 = Math.min(x0, x);
    x1 = Math.max(x1, x);
    y0 = Math.min(y0, y);
    y1 = Math.max(y1, y);
  }
  return x1 < 0 ? null : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

/** GIF's LZW, with 8-bit codes, written as length-prefixed sub-blocks. */
function lzw(out, pixels) {
  const CLEAR = 256;
  const END = 257;
  let dict = new Map();
  let next = END + 1;
  let size = 9;
  let bits = 0;
  let nbits = 0;
  const block = [];
  const emit = (code) => {
    bits |= code << nbits;
    nbits += size;
    while (nbits >= 8) {
      block.push(bits & 0xff);
      bits >>>= 8;
      nbits -= 8;
      if (block.length === 255) out.push(255, ...block.splice(0));
    }
  };
  out.push(8);
  emit(CLEAR);
  let prefix = pixels[0];
  for (let i = 1; i < pixels.length; i++) {
    const k = pixels[i];
    const key = (prefix << 8) | k;
    const code = dict.get(key);
    if (code !== undefined) {
      prefix = code;
      continue;
    }
    emit(prefix);
    if (next < 4096) {
      dict.set(key, next++);
      if (next > 1 << size && size < 12) size++;
    } else {
      emit(CLEAR);
      dict = new Map();
      next = END + 1;
      size = 9;
    }
    prefix = k;
  }
  emit(prefix);
  emit(END);
  if (nbits > 0) block.push(bits & 0xff);
  if (block.length) out.push(block.length, ...block);
  out.push(0);
}

/**
 * Encodes frames as a GIF that loops forever. After the first frame, only the
 * rectangle that changed is stored, and a frame identical to the last one just
 * lengthens it.
 *
 * @param {Uint8ClampedArray[]} frames - RGBA pixels, `width` x `height` each
 * @param {number} width - In pixels
 * @param {number} height - In pixels
 * @param {number} delay - Hundredths of a second per frame
 * @returns {Uint8Array} The GIF file
 */
export function encodeGif(frames, width, height, delay) {
  const pal = palette(frames);
  const indexed = index(frames, pal);
  // Disposal 1 keeps the last frame under the next, which saves storing what didn't
  // change. A see-through pixel would let the last frame show through, which is right
  // only while the see-through area stays put, as a frame's corners do; otherwise
  // every frame is stored whole and cleared (disposal 2).
  const clearHolds = indexed.every((f) => f.every((v, i) => (v === pal.clear) === (indexed[0][i] === pal.clear)));
  const disposal = clearHolds ? 1 : 2;
  const whole = { x: 0, y: 0, w: width, h: height };
  const steps = [];
  for (const [i, pixels] of indexed.entries()) {
    const diff = i === 0 ? whole : changed(indexed[i - 1], pixels, width);
    const rect = diff && !clearHolds ? whole : diff;
    if (rect) steps.push({ pixels, rect, delay });
    else steps[steps.length - 1].delay += delay;
  }

  const out = new Bytes();
  out.push(...[...'GIF89a'].map((ch) => ch.charCodeAt(0)));
  out.word(width);
  out.word(height);
  out.push(0xf7, 0, 0); // a global table of 256 colours
  for (let i = 0; i < 256; i++) {
    const c = pal.colours[i] ?? 0;
    out.push(c >> 16, (c >> 8) & 255, c & 255);
  }
  if (steps.length > 1) out.push(0x21, 0xff, 11, ...[...'NETSCAPE2.0'].map((ch) => ch.charCodeAt(0)), 3, 1, 0, 0, 0);
  for (const { pixels, rect, delay: d } of steps) {
    out.push(0x21, 0xf9, 4, (disposal << 2) | (pal.clear >= 0 ? 1 : 0));
    out.word(steps.length > 1 ? d : 0);
    out.push(Math.max(pal.clear, 0), 0);
    out.push(0x2c);
    for (const n of [rect.x, rect.y, rect.w, rect.h]) out.word(n);
    out.push(0);
    const sub = new Uint8Array(rect.w * rect.h);
    for (let y = 0; y < rect.h; y++) {
      const start = (rect.y + y) * width + rect.x;
      sub.set(pixels.subarray(start, start + rect.w), y * rect.w);
    }
    lzw(out, sub);
  }
  out.push(0x3b);
  return out.done();
}
