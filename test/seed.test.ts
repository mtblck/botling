import { describe, expect, it } from 'vitest';
import { botling, randomSeed } from '../src/index.js';

describe('randomSeed', () => {
  it('reads as adjective-noun-number', () => {
    for (let i = 0; i < 200; i++) expect(randomSeed()).toMatch(/^[a-z]+-[a-z]+-\d{1,3}$/);
  });

  it('gives a new seed each call', () => {
    expect(new Set(Array.from({ length: 100 }, () => randomSeed())).size).toBeGreaterThan(90);
  });

  it('takes its randomness from the source it is given', () => {
    expect(randomSeed(() => 0)).toBe('brave-bolt-0');
    expect(randomSeed(() => 0.9999)).toBe('turbo-spark-999');
    expect(randomSeed(() => 1)).toBe('turbo-spark-999');
    expect(randomSeed(() => -1)).toBe('brave-bolt-0');
  });

  it('falls back to Math.random without Web Crypto', () => {
    const crypto = globalThis.crypto;
    Object.defineProperty(globalThis, 'crypto', { value: undefined, configurable: true });
    try {
      expect(randomSeed()).toMatch(/^[a-z]+-[a-z]+-\d{1,3}$/);
    } finally {
      Object.defineProperty(globalThis, 'crypto', { value: crypto, configurable: true });
    }
  });

  it('hands out a seed that keeps drawing the same robot', () => {
    const seed = randomSeed();
    expect(botling(seed)).toBe(botling(seed));
  });
});
