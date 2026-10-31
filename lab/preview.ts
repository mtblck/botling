/**
 * The lab styles the site shows as previews, bundled by scripts/site.mjs into
 * dist-site/preview.js. Their art is unfrozen. Snoot, Beastie and Noggin are in
 * the package now, so the site draws them from /lib instead.
 */
import type { Kind } from './kinds/art.js';
import { renderKind } from './render.js';

/** A preview style: its name and a renderer for a seed at a size. */
export interface PreviewStyle {
  name: string;
  render: (seed: string, size: number) => string;
}

/** Wraps a lab kind as a preview style. */
export const preview = <T>(kind: Kind<T>): PreviewStyle => ({
  name: kind.name,
  render: (seed, size) => renderKind(kind, seed, { size, frame: 'square' }),
});

/** None today: every style the site shows is in the package. New lab styles go here first. */
export const PREVIEWS: readonly PreviewStyle[] = [];
