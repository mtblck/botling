import { describe, expect, it } from 'vitest';
import {
  CENTER,
  EYES,
  GRID_SIZE,
  grid,
  HEADS,
  MOUTHS,
  PATTERNS,
  Role,
  type Role as RoleT,
  SIDES,
  TOPS,
  type Traits,
  traits,
} from '../src/index.js';

const count = (g: RoleT[][], role: RoleT): number => g.flat().filter((r) => r === role).length;

/**
 * Every head, eye and mouth combination at the narrowest and widest head,
 * with and without a screen and shoulders. Tops and sides rotate through
 * the list so each one meets many faces without a full cross product.
 */
function* combinations(): Generator<Traits> {
  const base: Traits = { ...traits('combinations'), quirk: 'none', accessory: 'none' };
  let i = 0;
  for (const head of HEADS)
    for (const eyes of EYES)
      for (const mouth of MOUTHS)
        for (const halfWidth of [3, 5])
          for (const hasScreen of [true, false])
            for (const hasShoulders of [true, false]) {
              const top = TOPS[i % TOPS.length] ?? 'none';
              const sides = SIDES[i % SIDES.length] ?? 'none';
              const pattern = PATTERNS[i % PATTERNS.length] ?? 'none';
              i++;
              yield {
                ...base,
                head,
                eyes,
                mouth,
                top,
                sides,
                pattern,
                halfWidth,
                hasScreen,
                hasShoulders,
                topRow: 3,
                bottomRow: 12,
              };
            }
}

describe('grid', () => {
  it('is GRID_SIZE square with an odd centre column', () => {
    const g = grid(traits('size'));
    expect(g).toHaveLength(GRID_SIZE);
    for (const row of g) expect(row).toHaveLength(GRID_SIZE);
    expect(CENTER).toBe((GRID_SIZE - 1) / 2);
  });

  it('is mirror-symmetric for every part except mismatched eyes, winks, quirks and some accessories', () => {
    for (const t of combinations()) {
      if (t.eyes === 'mismatch' || t.eyes === 'wink') continue;
      for (const row of grid(t)) expect(row).toEqual([...row].reverse());
    }
  });

  it("keeps every antenna tip off the top row, so it doesn't touch the tile's edge", () => {
    for (let i = 0; i < 500; i++) expect(grid(traits(`tip-${i}`))[0]?.every((r) => r === 0)).toBe(true);
  });

  it('centres a robot without shoulders top to bottom, to the row (two rows on triangles)', () => {
    for (let i = 0; i < 500; i++) {
      const t = traits(`mid-${i}`);
      if (t.hasShoulders) continue;
      const used = grid(t).flatMap((row, y) => (row.some((r) => r !== Role.Empty) ? [y] : []));
      const above = used[0] ?? 0;
      const below = GRID_SIZE - 1 - (used.at(-1) ?? 0);
      expect(Math.abs(above - below)).toBeLessThanOrEqual(t.shape === 'triangle' ? 3 : 1);
    }
  });

  it('gives mismatched eyes one glowing and one accent eye', () => {
    const t: Traits = {
      ...traits('mismatch'),
      eyes: 'mismatch',
      mouth: 'none',
      hasCheeks: false,
      top: 'none',
      sides: 'none',
      pattern: 'none',
      quirk: 'none',
      accessory: 'none',
    };
    const g = grid(t);
    const left = g.map((row) => row.slice(0, CENTER));
    const right = g.map((row) => row.slice(CENTER + 1));
    expect(count(left, Role.Glow)).toBe(2);
    expect(count(right, Role.Glow)).toBe(0);
    expect(count(right, Role.Accent)).toBe(1);
  });

  it('always draws a body and keeps both eyes visible', () => {
    for (const t of combinations()) {
      const g = grid(t);
      expect(count(g, Role.Body) + count(g, Role.Shade)).toBeGreaterThan(10);
      expect(count(g, Role.Glow) + count(g, Role.Accent)).toBeGreaterThanOrEqual(2);
    }
  });

  it('leaves the shoulder rows empty without shoulders', () => {
    const g = grid({ ...traits('bare'), hasShoulders: false, bottomRow: 12 });
    expect(g[13]?.every((r) => r === Role.Empty)).toBe(true);
    expect(g[14]?.every((r) => r === Role.Empty)).toBe(true);
  });
});
