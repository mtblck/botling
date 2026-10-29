import { describe, expect, it } from 'vitest';
import { createRng, hash, int, pick } from '../src/random.js';

describe('hash', () => {
  it('matches the FNV-1a reference values', () => {
    expect(hash('')).toBe(0x811c9dc5);
    expect(hash('a')).toBe(0xe40c292c);
    expect(hash('foobar')).toBe(0xbf9cf968);
  });
});

describe('createRng', () => {
  it('repeats the same sequence for the same seed', () => {
    const a = createRng('seed');
    const b = createRng('seed');
    for (let i = 0; i < 50; i++) expect(a()).toBe(b());
  });

  it('stays in [0, 1)', () => {
    const r = createRng('range');
    for (let i = 0; i < 10_000; i++) {
      const n = r();
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    }
  });
});

describe('pick and int', () => {
  it('cover every value over many draws', () => {
    const r = createRng('cover');
    const picked = new Set<string>();
    const ints = new Set<number>();
    for (let i = 0; i < 500; i++) {
      picked.add(pick(r, ['a', 'b', 'c']));
      ints.add(int(r, 3, 5));
    }
    expect([...picked].sort()).toEqual(['a', 'b', 'c']);
    expect([...ints].sort()).toEqual([3, 4, 5]);
  });
});
