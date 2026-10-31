import { createRng, int, maybePick, pick } from '../../core/random.js';
import { PALETTES } from './palettes.js';
import { BODIES, EYES, MOUTHS, SHAPES, SIDES, TOPS } from './parts.js';
import type { BeastieTraits } from './types.js';

/**
 * Picks every trait for a seed. The seed is salted, so a seed's Beastie shares
 * nothing with its Botling or Snoot.
 *
 * @param seed - Any string, such as a user id
 * @returns The Beastie's traits
 */
export function traits(seed: string): BeastieTraits {
  const rng = createRng(`beastie:${String(seed)}`);
  // Draw order is part of the picture: once Beastie is stable, don't reorder these lines.
  return {
    palette: Math.floor(rng() * PALETTES.length),
    body: pick(rng, BODIES),
    eyes: pick(rng, EYES),
    mouth: pick(rng, MOUTHS),
    top: pick(rng, TOPS),
    sides: maybePick(rng, 0.5, SIDES),
    halfWidth: int(rng, 4, 5),
    hasSpots: rng() < 0.4,
    shape: pick(rng, SHAPES),
  };
}
