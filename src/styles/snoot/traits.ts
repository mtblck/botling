import { createRng, int, maybePick, pick } from '../../core/random.js';
import { PALETTES } from './palettes.js';
import { EXTRAS, EYES, MARKINGS, SHAPE_ODDS, SPECIES } from './parts.js';
import type { SnootTraits } from './types.js';

/**
 * Picks every trait for a seed. The seed is salted, so a seed's Snoot shares
 * nothing with its Botling.
 *
 * @param seed - Any string, such as a user id
 * @returns The Snoot's traits
 */
export function traits(seed: string): SnootTraits {
  const rng = createRng(`snoot:${String(seed)}`);
  // Draw order is part of the picture: once Snoot is stable, don't reorder these lines.
  return {
    palette: Math.floor(rng() * PALETTES.length),
    species: pick(rng, SPECIES),
    eyes: pick(rng, EYES),
    marking: maybePick(rng, 0.4, MARKINGS),
    extra: maybePick(rng, 0.3, EXTRAS),
    halfWidth: int(rng, 4, 5),
    isTall: rng() < 0.5,
    hasCheeks: rng() < 0.4,
    shape: pick(rng, SHAPE_ODDS),
  };
}
