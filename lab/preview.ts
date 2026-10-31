/**
 * The preview styles the site shows next to Botling, bundled by scripts/site.mjs into
 * dist-site/preview.js. Their art is unfrozen: a seed's Snoot can change before it ships.
 */
import { animal } from './kinds/animal.js';
import type { Kind } from './kinds/art.js';
import { monster } from './kinds/monster.js';
import { person } from './kinds/person.js';
import { renderKind } from './render.js';

/** A preview style: its name and a renderer for a seed at a size. */
export interface PreviewStyle {
  name: string;
  render: (seed: string, size: number) => string;
}

const preview = <T>(kind: Kind<T>): PreviewStyle => ({
  name: kind.name,
  render: (seed, size) => renderKind(kind, seed, { size, frame: 'square' }),
});

/** Snoot, Noggin and Beastie, in the order the site shows them. */
export const PREVIEWS: readonly PreviewStyle[] = [preview(animal), preview(person), preview(monster)];
