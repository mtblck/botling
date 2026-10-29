/**
 * botling: seeded robot avatars drawn on a grid of squares, circles or triangles.
 *
 * @packageDocumentation
 */
export { CENTER, GRID_SIZE, grid } from './grid/index.js';
export { PALETTES } from './palettes.js';
export { EYES, HEADS, MOUTHS, SHAPES, SIDES, TOPS } from './parts.js';
export { botling, botlingDataUri, resolveTraits } from './render/svg.js';
export { traits } from './traits.js';
export type {
  BotlingOptions,
  Eyes,
  Head,
  Mouth,
  Palette,
  RoleGrid,
  Shape,
  Sides,
  Top,
  Traits,
} from './types.js';
export { Role } from './types.js';
