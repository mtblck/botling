import { describe, expect, it } from 'vitest';
import { num, paintAttrs, pathData } from '../src/core/render/path.js';

describe('num', () => {
  it('writes the shortest decimal', () => {
    expect(num(880)).toBe('.88');
    expect(num(-500)).toBe('-.5');
    expect(num(3000)).toBe('3');
    expect(num(-1010)).toBe('-1.01');
    expect(num(0)).toBe('0');
    expect(num(7)).toBe('.007');
  });
});

describe('pathData', () => {
  it('closes polygons and moves between them relatively', () => {
    const square = (x: number, y: number) =>
      [
        [x, y],
        [x + 640, y],
        [x + 640, y + 640],
        [x, y + 640],
      ] as const;
    expect(pathData([square(180, 180), square(1180, 180), square(180, 1180)])).toBe(
      'm.18 .18h.64v.64h-.64zm1 0h.64v.64h-.64zm-1 1h.64v.64h-.64z',
    );
  });

  it('leaves out the l after a move, and uses h for flat edges', () => {
    const triangle = [
      [500, 0],
      [1500, 1000],
      [-500, 1000],
    ] as const;
    expect(pathData([triangle])).toBe('m.5 0 1 1h-2z');
    const diamond = [
      [500, 0],
      [1000, 500],
      [500, 1000],
      [0, 500],
    ] as const;
    expect(pathData([diamond])).toBe('m.5 0 .5 .5-.5 .5-.5-.5z');
  });

  it('draws a single point as a zero-length dot', () => {
    expect(pathData([[[500, 500]], [[1500, 500]], [[500, 1500]]])).toBe('m.5 .5h0m1 0h0m-1 1h0');
  });
});

describe('paintAttrs', () => {
  it('fills or strokes with the colour as given', () => {
    expect(paintAttrs('#abc', 'fill')).toBe('fill="#abc"');
    expect(paintAttrs('#abcdef80', 'stroke')).toBe('stroke="#abcdef80"');
    expect(paintAttrs('#abcdef', 'both')).toBe('fill="#abcdef" stroke="#abcdef"');
  });

  it('moves alpha to opacity when filling and stroking, so the overlap stays even', () => {
    expect(paintAttrs('#abcdef80', 'both')).toBe('fill="#abcdef" stroke="#abcdef" opacity=".502"');
    expect(paintAttrs('#abc8', 'both')).toBe('fill="#abc" stroke="#abc" opacity=".533"');
    expect(paintAttrs('#ABCDEFFF', 'both')).toBe('fill="#ABCDEF" stroke="#ABCDEF" opacity="1"');
  });
});
