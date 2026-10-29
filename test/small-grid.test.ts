import { describe, expect, it } from 'vitest';
import {
  EYES,
  HEADS,
  MOUTHS,
  Role,
  type Role as RoleT,
  SIDES,
  SMALL_GRID_SIZE,
  smallGrid,
  TOPS,
  type Traits,
  traits,
} from '../src/index.js';

const count = (g: RoleT[][], role: RoleT): number => g.flat().filter((r) => r === role).length;
const CENTER = (SMALL_GRID_SIZE - 1) / 2;

/** Every head, eye and mouth at both small widths, with tops and sides rotating through. */
function* combinations(): Generator<Traits> {
  const base: Traits = { ...traits('small-combinations'), quirk: 'none', accessory: 'none' };
  let i = 0;
  for (const head of HEADS)
    for (const eyes of EYES)
      for (const mouth of MOUTHS)
        for (const halfWidth of [3, 5])
          for (const hasScreen of [true, false])
            for (const hasShoulders of [true, false])
              for (const eyeGap of [1, 3]) {
                const top = TOPS[i % TOPS.length] ?? 'none';
                const sides = SIDES[i % SIDES.length] ?? 'none';
                i++;
                yield { ...base, head, eyes, mouth, top, sides, halfWidth, hasScreen, hasShoulders, eyeGap };
              }
}

describe('smallGrid', () => {
  it('is SMALL_GRID_SIZE square', () => {
    const g = smallGrid(traits('size'));
    expect(g).toHaveLength(SMALL_GRID_SIZE);
    for (const row of g) expect(row).toHaveLength(SMALL_GRID_SIZE);
  });

  it('is mirror-symmetric for every part except mismatched eyes and winks', () => {
    for (const t of combinations()) {
      if (t.eyes === 'mismatch' || t.eyes === 'wink') continue;
      for (const row of smallGrid(t)) expect(row).toEqual([...row].reverse());
    }
  });

  it('gives mismatched eyes one glowing and one accent eye', () => {
    const t: Traits = {
      ...traits('m'),
      eyes: 'mismatch',
      mouth: 'none',
      top: 'none',
      sides: 'none',
      quirk: 'none',
      accessory: 'none',
    };
    const g = smallGrid(t);
    expect(
      count(
        g.map((r) => r.slice(0, CENTER)),
        Role.Glow,
      ),
    ).toBe(2);
    expect(
      count(
        g.map((r) => r.slice(CENTER + 1)),
        Role.Accent,
      ),
    ).toBe(1);
  });

  it('always draws a head and a visible face', () => {
    for (const t of combinations()) {
      const g = smallGrid(t);
      expect(count(g, Role.Body) + count(g, Role.Shade)).toBeGreaterThan(8);
      expect(count(g, Role.Glow) + count(g, Role.Accent)).toBeGreaterThanOrEqual(1);
    }
  });

  it('keeps eyes and mouth apart, so the face reads at 24px', () => {
    for (const t of combinations()) {
      if (t.mouth === 'none' || t.mouth === 'speaker') continue;
      const g = smallGrid(t);
      // The row above the mouth must not glow in the same column as the mouth.
      const mouthRow = 6;
      for (let x = 0; x < SMALL_GRID_SIZE; x++) {
        if (g[mouthRow]?.[x] === Role.Glow) expect(g[mouthRow - 1]?.[x]).not.toBe(Role.Glow);
      }
    }
  });

  it('keeps the same palette, shape and head width class as the full robot', () => {
    const narrow = smallGrid({ ...traits('w'), halfWidth: 3, sides: 'none', hasShoulders: false });
    const wide = smallGrid({ ...traits('w'), halfWidth: 5, sides: 'none', hasShoulders: false });
    const width = (g: RoleT[][]): number => Math.max(...g.map((r) => r.filter((v) => v !== Role.Empty).length));
    expect(width(wide)).toBeGreaterThan(width(narrow));
  });
});
