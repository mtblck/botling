/**
 * seedkin/snoot: the Snoots, seeded animal avatars. A Preview style: the
 * Snoot a seed draws can still change in a minor version.
 *
 * @packageDocumentation
 */

export { FRAMES } from '../../core/render/frame.js';
export { LOOKS } from '../../core/render/look.js';
export { randomSeed } from '../../core/seed.js';
export { CENTER, GRID_SIZE, grid, SMALL_GRID_SIZE, smallGrid } from './grid/index.js';
export { PALETTES } from './palettes.js';
export { EXTRAS, EYES, MARKINGS, SHAPES, SPECIES } from './parts.js';
export { resolveTraits, snoot, snootDataUri } from './svg.js';
export { traits } from './traits.js';
export type {
  Detail,
  Extra,
  Eyes,
  Frame,
  Look,
  Marking,
  Palette,
  RoleGrid,
  Shape,
  SnootOptions,
  SnootTraits,
  Species,
} from './types.js';
export { Role } from './types.js';
