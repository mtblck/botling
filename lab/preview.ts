/**
 * The lab styles the site shows as previews, bundled by scripts/site.mjs into
 * dist-site/preview.js. Their art is unfrozen. Snoot is in the package now, so
 * the site draws it from /lib instead.
 */
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

/** Noggin and Beastie, in the order the site shows them. */
export const PREVIEWS: readonly PreviewStyle[] = [preview(person), preview(monster)];
