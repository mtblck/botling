import { createRng, int, maybePick, pick } from '../../core/random.js';
import { PALETTES } from './palettes.js';
import { ACCESSORIES, EYES, HEADS, MOUTHS, PATTERNS, QUIRKS, SHAPES, SIDES, TOPS } from './parts.js';
import type { Traits } from './types.js';

/**
 * Picks every trait for a seed. Same seed, same robot, for as long as the
 * major version stays the same.
 *
 * @param seed - Any string, such as a user id
 * @returns The robot's traits
 */
export function traits(seed: string): Traits {
  // String() so untyped callers passing a number still get a per-value robot.
  const rng = createRng(String(seed));
  // Draw order is part of the output contract: do not reorder these lines.
  return {
    palette: Math.floor(rng() * PALETTES.length),
    head: pick(rng, HEADS),
    eyes: pick(rng, EYES),
    mouth: pick(rng, MOUTHS),
    top: pick(rng, TOPS),
    sides: pick(rng, SIDES),
    halfWidth: int(rng, 3, 5),
    topRow: int(rng, 3, 5),
    bottomRow: int(rng, 10, 12),
    hasScreen: rng() < 0.75,
    hasShoulders: rng() < 0.45,
    hasCheeks: rng() < 0.25,
    eyeGap: int(rng, 1, 3),
    shape: pick(rng, SHAPES),
    pattern: maybePick(rng, 0.35, PATTERNS),
    quirk: maybePick(rng, 0.25, QUIRKS),
    accessory: maybePick(rng, 0.25, ACCESSORIES),
    hasChestLight: rng() < 0.5,
  };
}
