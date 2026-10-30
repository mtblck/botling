/**
 * botling: seeded robot avatars drawn on a grid of squares, circles, triangles or diamonds.
 *
 * @packageDocumentation
 */
export { CENTER, GRID_SIZE, grid, SMALL_GRID_SIZE, smallGrid } from './grid/index.js';
export { HOLIDAY_PALETTES, type Holiday } from './holidays.js';
export { PALETTES } from './palettes.js';
export { ACCESSORIES, EYES, HEADS, MOUTHS, PATTERNS, QUIRKS, SHAPES, SIDES, TOPS } from './parts.js';
export { FRAMES } from './render/frame.js';
export { botling, botlingDataUri, resolveTraits } from './render/svg.js';
export { randomSeed } from './seed.js';
export { traits } from './traits.js';
export type {
  Accessory,
  BotlingOptions,
  Detail,
  Eyes,
  Frame,
  Head,
  Mouth,
  Palette,
  Pattern,
  Quirk,
  RoleGrid,
  Shape,
  Sides,
  Top,
  Traits,
} from './types.js';
export { Role } from './types.js';
