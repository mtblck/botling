import { createRng, int, maybePick, pick } from '../../core/random.js';
import { contrast, HAIR_COLOURS, PALETTES, SKIN_TONES } from './palettes.js';
import { EYES, EYEWEAR, FACIAL, HAIRS, HEADWEAR, MOUTHS, SHAPE_ODDS } from './parts.js';
import type { NogginTraits } from './types.js';

/** The first of `list`, starting at `from` and wrapping, that `ok` accepts; `from` if none does. */
function nextFit(length: number, from: number, ok: (i: number) => boolean): number {
  for (let i = 0; i < length; i++) if (ok((from + i) % length)) return (from + i) % length;
  return from;
}

/** The seed's outfit, or the next one whose background a face stands out from. */
export function outfitFor(skin: number, from: number): number {
  const body = (SKIN_TONES[skin] as { body: string }).body;
  return nextFit(PALETTES.length, from, (i) => contrast(body, (PALETTES[i] as { bg: string }).bg) >= 1.5);
}

/** The seed's hair colour, or the next one that stands out from the skin. */
export function hairFor(skin: number, from: number): number {
  const body = (SKIN_TONES[skin] as { body: string }).body;
  return nextFit(HAIR_COLOURS.length, from, (i) => contrast(HAIR_COLOURS[i] as string, body) >= 1.8);
}

/**
 * Picks every trait for a seed. The seed is salted, so a seed's Noggin shares
 * nothing with its other seedkin.
 *
 * @param seed - Any string, such as a user id
 * @returns The Noggin's traits
 */
export function traits(seed: string): NogginTraits {
  const rng = createRng(`noggin:${String(seed)}`);
  // Draw order is part of the picture: once Noggin is stable, don't reorder these lines.
  const skin = Math.floor(rng() * SKIN_TONES.length);
  return {
    skin,
    palette: outfitFor(skin, Math.floor(rng() * PALETTES.length)),
    hairColour: hairFor(skin, Math.floor(rng() * HAIR_COLOURS.length)),
    hair: pick(rng, HAIRS),
    eyes: pick(rng, EYES),
    mouth: pick(rng, MOUTHS),
    facial: maybePick(rng, 0.25, FACIAL),
    eyewear: maybePick(rng, 0.25, EYEWEAR),
    headwear: maybePick(rng, 0.3, HEADWEAR),
    halfWidth: int(rng, 3, 4),
    hasBrows: rng() < 0.4,
    hasCheeks: rng() < 0.35,
    shape: pick(rng, SHAPE_ODDS),
  };
}
