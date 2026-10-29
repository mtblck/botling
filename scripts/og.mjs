// The link preview image (og:image), drawn at build time with Node only: chat apps and
// social sites won't show an SVG, so the robots are rasterized here and written as a PNG.
// Square, circle and diamond cells only, with no background grid; that's all the card uses.
import zlib from 'node:zlib';

export const WIDTH = 1200;
export const HEIGHT = 630;
const PAGE = '#f3f2f8';
const INK = '#14121c';
/** Samples per pixel along each axis, for anti-aliased edges. */
const AA = 4;

/** Robots on the card, left to right; the middle one is the logo and the biggest. */
const ROBOTS = [
  { seed: 'cosmic-gear-83', shape: 'circle', palette: 'Lemon', size: 180 },
  { seed: 'rusty-bolt-12', shape: 'diamond', palette: 'Ember', size: 180 },
  { seed: 'jolly-sprocket-65', shape: 'square', palette: 'Ice', size: 300 },
  { seed: 'tiny-relay-3', shape: 'square', palette: 'Seafoam', size: 180 },
  { seed: 'pixel-pal-7', shape: 'circle', palette: 'Bubblegum', size: 180 },
];

// The word "botling", 5 cells wide (fewer for narrow letters) and 9 tall with a descender.
const GLYPHS = {
  b: ['1....', '1....', '1111.', '1...1', '1...1', '1...1', '1111.', '.....', '.....'],
  o: ['.....', '.....', '.111.', '1...1', '1...1', '1...1', '.111.', '.....', '.....'],
  t: ['.1..', '.1..', '1111', '.1..', '.1..', '.1..', '..11', '....', '....'],
  l: ['11.', '.1.', '.1.', '.1.', '.1.', '.1.', '111', '...', '...'],
  i: ['.1.', '...', '11.', '.1.', '.1.', '.1.', '111', '...', '...'],
  n: ['.....', '.....', '1111.', '1...1', '1...1', '1...1', '1...1', '.....', '.....'],
  g: ['.....', '.....', '.1111', '1...1', '1...1', '1...1', '.1111', '....1', '.111.'],
};

const rgb = (hex) => {
  const h = hex.length === 4 ? hex.replace(/[0-9a-f]/gi, '$&$&') : hex;
  return [1, 3, 5].map((i) => Number.parseInt(h.slice(i, i + 2), 16));
};

/** An RGB canvas that shapes are blended onto by how much of each pixel they cover. */
function canvas(fill) {
  const px = new Uint8Array(WIDTH * HEIGHT * 3);
  const [r, g, b] = rgb(fill);
  for (let i = 0; i < px.length; i += 3) px.set([r, g, b], i);
  /** Paints the shape `inside(x, y)` within its bounding box, in a colour. */
  const paint = (x0, y0, x1, y1, inside, colour) => {
    const c = rgb(colour);
    for (let y = Math.max(0, Math.floor(y0)); y < Math.min(HEIGHT, Math.ceil(y1)); y++) {
      for (let x = Math.max(0, Math.floor(x0)); x < Math.min(WIDTH, Math.ceil(x1)); x++) {
        let hits = 0;
        for (let sy = 0; sy < AA; sy++)
          for (let sx = 0; sx < AA; sx++) if (inside(x + (sx + 0.5) / AA, y + (sy + 0.5) / AA)) hits++;
        if (!hits) continue;
        const a = hits / (AA * AA);
        const i = (y * WIDTH + x) * 3;
        for (let k = 0; k < 3; k++) px[i + k] = Math.round(px[i + k] * (1 - a) + c[k] * a);
      }
    }
  };
  return { px, paint };
}

/** A rounded rectangle's inside test. */
const roundRect = (x0, y0, x1, y1, r) => (x, y) => {
  const dx = Math.max(x0 + r - x, 0, x - (x1 - r));
  const dy = Math.max(y0 + r - y, 0, y - (y1 - r));
  return x >= x0 && x <= x1 && y >= y0 && y <= y1 && dx * dx + dy * dy <= r * r;
};

/** One grid cell of a shape, matching the SVG renderer's geometry, at (left, top) with side u. */
function cell(shape, left, top, u) {
  const cx = left + u / 2;
  const cy = top + u / 2;
  if (shape === 'circle') return (x, y) => (x - cx) ** 2 + (y - cy) ** 2 <= (0.44 * u) ** 2;
  if (shape === 'diamond') return (x, y) => Math.abs(x - cx) + Math.abs(y - cy) <= 0.47 * u;
  return roundRect(left + 0.06 * u, top + 0.06 * u, left + 0.94 * u, top + 0.94 * u, 0.12 * u);
}

/** A robot tile: its background square, rounded, with the robot's cells on it. */
function robot(lib, paint, { seed, shape, palette, size }, left, top) {
  const p = lib.PALETTES.find((q) => q.name === palette);
  const t = lib.resolveTraits(seed, { shape, palette: lib.PALETTES.indexOf(p) });
  const colours = {
    [lib.Role.Body]: p.body,
    [lib.Role.Screen]: p.screen,
    [lib.Role.Glow]: t.hasScreen ? p.glow : p.screen,
    [lib.Role.Accent]: p.accent,
    [lib.Role.Shade]: p.shade,
  };
  paint(left, top, left + size, top + size, roundRect(left, top, left + size, top + size, size * 0.1), p.bg);
  const cells = lib.grid(t);
  const u = size / (lib.GRID_SIZE + 1);
  for (const [y, row] of cells.entries()) {
    for (const [x, role] of row.entries()) {
      if (role === lib.Role.Empty) continue;
      const cl = left + (x + 0.5) * u;
      const ct = top + (y + 0.5) * u;
      paint(cl, ct, cl + u, ct + u, cell(shape, cl, ct, u), colours[role]);
    }
  }
}

/** The word "botling" in square cells, centred on x at a top edge. */
function wordmark(paint, centre, top, u) {
  const letters = [...'botling'].map((ch) => GLYPHS[ch]);
  const width = letters.reduce((w, g) => w + g[0].length + 1, -1) * u;
  let left = centre - width / 2;
  for (const g of letters) {
    for (const [y, row] of g.entries()) {
      for (const [x, on] of [...row].entries()) {
        if (on !== '1') continue;
        const cl = left + x * u;
        const ct = top + y * u;
        paint(cl, ct, cl + u, ct + u, cell('square', cl, ct, u), INK);
      }
    }
    left += (g[0].length + 1) * u;
  }
}

const CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};

/** Encodes RGB pixels as a PNG: 8-bit truecolour, no filtering. */
function png(px) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(WIDTH, 0);
  header.writeUInt32BE(HEIGHT, 4);
  header.set([8, 2, 0, 0, 0], 8);
  const raw = Buffer.alloc(HEIGHT * (WIDTH * 3 + 1));
  for (let y = 0; y < HEIGHT; y++) raw.set(px.subarray(y * WIDTH * 3, (y + 1) * WIDTH * 3), y * (WIDTH * 3 + 1) + 1);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/**
 * Draws the link preview card: five robots in a row above the wordmark.
 *
 * @param {object} lib - The botling package (its build, or the sources in a test)
 * @returns {Buffer} A 1200x630 PNG
 */
export function ogImage(lib) {
  const { px, paint } = canvas(PAGE);
  const gap = 24;
  const total = ROBOTS.reduce((w, r) => w + r.size, 0) + gap * (ROBOTS.length - 1);
  const middle = 250;
  let left = (WIDTH - total) / 2;
  for (const r of ROBOTS) {
    robot(lib, paint, r, left, middle - r.size / 2);
    left += r.size + gap;
  }
  wordmark(paint, WIDTH / 2, 440, 14);
  return png(px);
}
