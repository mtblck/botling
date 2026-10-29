/** A function returning a float in [0, 1). */
export type Rng = () => number;

/**
 * 32-bit FNV-1a hash of a string's UTF-16 code units.
 *
 * @param input - Any string
 * @returns An unsigned 32-bit integer
 */
export function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Seeded mulberry32 generator. The same seed always yields the same sequence,
 * which is what makes a robot stable for a given user id.
 *
 * @param seed - Any string
 * @returns A generator of floats in [0, 1)
 */
export function createRng(seed: string): Rng {
  let a = hash(seed);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Picks one item from a non-empty list.
 *
 * @param rng - Generator to draw from
 * @param list - Items to choose between
 * @returns One item of `list`
 */
export function pick<T>(rng: Rng, list: readonly T[]): T {
  return list[Math.floor(rng() * list.length)] as T;
}

/**
 * Picks an integer in an inclusive range.
 *
 * @param rng - Generator to draw from
 * @param lo - Smallest value
 * @param hi - Largest value
 * @returns An integer from `lo` to `hi`
 */
export function int(rng: Rng, lo: number, hi: number): number {
  return lo + Math.floor(rng() * (hi - lo + 1));
}
