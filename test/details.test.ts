import { describe, expect, it } from 'vitest';
import { slots } from '../src/grid/slots.js';
import {
  ACCESSORIES,
  CENTER,
  grid,
  QUIRKS,
  Role,
  type Role as RoleT,
  SMALL_GRID_SIZE,
  smallGrid,
  type Traits,
  traits,
} from '../src/index.js';

const count = (g: RoleT[][], role: RoleT): number => g.flat().filter((r) => r === role).length;
const isSymmetric = (g: RoleT[][]): boolean => g.every((row) => row.join() === [...row].reverse().join());

/** A plain robot to add one thing to at a time. */
const plain: Traits = {
  ...traits('plain'),
  head: 'box',
  eyes: 'dot',
  mouth: 'line',
  top: 'antenna',
  sides: 'ears',
  halfWidth: 4,
  topRow: 4,
  bottomRow: 11,
  hasScreen: true,
  hasShoulders: true,
  hasCheeks: false,
  shape: 'square',
  pattern: 'none',
  quirk: 'none',
  accessory: 'none',
  hasChestLight: false,
};

describe('slots', () => {
  it('lets headphones take the top and the sides, and hide a one-sided ear', () => {
    expect(slots({ ...plain, accessory: 'headphones', quirk: 'ear' })).toEqual({
      hasTop: false,
      hasSides: false,
      hasQuirk: false,
      isTopped: true,
    });
  });

  it('lets a cap or bow hide an off-side antenna, but not an ear', () => {
    expect(slots({ ...plain, accessory: 'cap', quirk: 'antenna' }).hasQuirk).toBe(false);
    expect(slots({ ...plain, accessory: 'bow', quirk: 'ear' })).toMatchObject({ hasQuirk: true, hasSides: false });
  });

  it('keeps the top and sides for a visor', () => {
    expect(slots({ ...plain, accessory: 'visor' })).toMatchObject({ hasTop: true, hasSides: true });
  });
});

describe('quirks and accessories', () => {
  it.each(QUIRKS.filter((q) => q !== 'none'))('draws a %s on one side only', (quirk) => {
    const g = grid({ ...plain, quirk });
    expect(g).not.toEqual(grid(plain));
    expect(isSymmetric(g)).toBe(false);
  });

  it.each(ACCESSORIES.filter((a) => a !== 'none'))('draws %s, at both sizes', (accessory) => {
    expect(grid({ ...plain, accessory })).not.toEqual(grid(plain));
    expect(smallGrid({ ...plain, accessory })).not.toEqual(smallGrid(plain));
  });

  it('puts the chest light on the shoulders only', () => {
    expect(grid({ ...plain, hasChestLight: true })[14]?.[CENTER]).toBe(Role.Glow);
    const bare = grid({ ...plain, hasShoulders: false, hasChestLight: true });
    expect(bare[14]?.every((r) => r === Role.Empty)).toBe(true);
  });

  it('keeps head markings off the face', () => {
    for (const pattern of ['stripe', 'rivets', 'chin'] as const) {
      const g = grid({ ...plain, pattern });
      expect(count(g, Role.Screen)).toBe(count(grid(plain), Role.Screen));
      expect(count(g, Role.Glow)).toBe(count(grid(plain), Role.Glow));
    }
  });

  it('keeps every small grid in bounds', () => {
    for (const accessory of ACCESSORIES)
      for (const quirk of QUIRKS) {
        const g = smallGrid({ ...plain, accessory, quirk, halfWidth: 5 });
        expect(g.every((row) => row.length === SMALL_GRID_SIZE)).toBe(true);
      }
  });
});

describe('shape-specific parts', () => {
  it('rounds rounded heads into circles on circle cells', () => {
    const t: Traits = { ...plain, head: 'rounded', top: 'none', sides: 'none', hasShoulders: false };
    const round = grid({ ...t, shape: 'circle' });
    const square = grid(t);
    expect(count(round, Role.Body) + count(round, Role.Shade)).toBeLessThan(
      count(square, Role.Body) + count(square, Role.Shade),
    );
  });

  it('steps a dome by half cells on triangle cells', () => {
    const t: Traits = { ...plain, head: 'dome', top: 'none' };
    expect(count(grid({ ...t, shape: 'triangle' }), Role.Shade)).toBeGreaterThan(count(grid(t), Role.Shade));
  });

  it('draws block eyes as rings on circles and crosses as chevrons on triangles', () => {
    expect(grid({ ...plain, eyes: 'block', shape: 'circle' })).not.toEqual(grid({ ...plain, eyes: 'block' }));
    expect(grid({ ...plain, eyes: 'cross', shape: 'triangle' })).not.toEqual(grid({ ...plain, eyes: 'cross' }));
  });

  it('leaves the other shapes alone', () => {
    const t: Traits = { ...plain, head: 'dome', eyes: 'cross' };
    expect(grid({ ...t, shape: 'diamond' })).toEqual(grid(t));
  });
});
