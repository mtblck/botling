import type { CellStyle, Outline, Point } from './cell.js';

/**
 * Formats thousandths of a unit as the shortest decimal: 880 is ".88",
 * -500 is "-.5", 3000 is "3".
 *
 * @param milli - An integer number of thousandths
 * @returns The number for an SVG attribute or path
 */
export function num(milli: number): string {
  // k / 1000 is the double nearest k thousandths, and prints as exactly that.
  const s = String(milli / 1000);
  if (s.startsWith('0.')) return s.slice(1);
  if (s.startsWith('-0.')) return `-${s.slice(2)}`;
  return s;
}

const MINUS = 45;

/**
 * Path data for a set of cells, with every move and edge relative so each
 * number stays small. Polygons are closed with `z`, which returns to their
 * first point; a point with a radius is reached by a clockwise arc; a one-point outline is a zero-length `h0`, which a round cap
 * draws as a dot. The first `m` of a path counts as absolute, from 0,0.
 *
 * @param outlines - Cells in thousandths, in drawing order
 * @returns The `d` attribute
 */
export function pathData(outlines: readonly Outline[]): string {
  let d = '';
  // Whether d ends in a number, tracked rather than read back: reading a
  // character of a string built by += makes the engine flatten it each time.
  let afterNumber = false;
  const cmd = (c: string): void => {
    d += c;
    afterNumber = false;
  };
  const put = (n: number): void => {
    const s = num(n);
    // A minus sign or a command letter separates numbers on its own.
    d += afterNumber && s.charCodeAt(0) !== MINUS ? ` ${s}` : s;
    afterNumber = true;
  };
  let cx = 0;
  let cy = 0;
  for (const o of outlines) {
    const first = o[0];
    if (!first) continue;
    cmd('m');
    put(first[0] - cx);
    put(first[1] - cy);
    [cx, cy] = first;
    if (o.length === 1) {
      cmd('h');
      put(0);
      continue;
    }
    // After a move, bare coordinate pairs are line-tos, so `l` can be left out.
    let last = 'l';
    let px = cx;
    let py = cy;
    for (let i = 1; i < o.length; i++) {
      const [x, y, r] = o[i] as Point;
      if (r !== undefined) {
        // Flags are written in full: some parsers misread them run together.
        if (last !== 'a') cmd('a');
        put(r);
        put(r);
        d += ' 0 0 1';
        afterNumber = true;
        put(x - px);
        put(y - py);
        last = 'a';
        px = x;
        py = y;
        continue;
      }
      const next = y === py ? 'h' : x === px ? 'v' : 'l';
      if (next !== last) cmd(next);
      if (next !== 'v') put(x - px);
      if (next !== 'h') put(y - py);
      last = next;
      px = x;
      py = y;
    }
    cmd('z');
  }
  return d;
}

const HEX_ALPHA = /^#(?:([0-9a-f]{3})([0-9a-f])|([0-9a-f]{6})([0-9a-f]{2}))$/i;

/**
 * The paint attributes for one colour. A colour with alpha that is both filled
 * and stroked moves its alpha to `opacity`, so the stroke laid over the fill
 * doesn't darken it.
 *
 * @param colour - A hex colour
 * @param paint - The shape's paint mode
 * @returns Attributes for the colour's `<path>`
 */
export function paintAttrs(colour: string, paint: CellStyle['paint']): string {
  if (paint === 'fill') return `fill="${colour}"`;
  if (paint === 'stroke') return `stroke="${colour}"`;
  const m = HEX_ALPHA.exec(colour);
  if (!m) return `fill="${colour}" stroke="${colour}"`;
  const rgb = `#${m[1] ?? m[3]}`;
  const a = m[2] ?? '';
  const alpha = a ? Number.parseInt(a + a, 16) : Number.parseInt(m[4] ?? 'ff', 16);
  return `fill="${rgb}" stroke="${rgb}" opacity="${num(Math.round((alpha / 255) * 1000))}"`;
}
