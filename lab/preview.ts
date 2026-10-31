/**
 * The lab styles the site shows as previews, bundled by scripts/site.mjs into
 * dist-site/preview.js. Their art is unfrozen. Snoot, Beastie, Noggin and
 * Sprite are in the package now, so the site draws them from /lib instead.
 */
import type { Frame } from '../src/core/types.js';

/** A preview style: its name and a renderer for a seed at a size. */
export interface PreviewStyle {
  name: string;
  render: (seed: string, size: number, frame?: Frame, animate?: boolean) => string;
}

/** None today: every style the site shows is in the package. New lab styles go here first. */
export const PREVIEWS: readonly PreviewStyle[] = [];
