/**
 * seedkin: a family of seeded pixel avatars drawn on a grid of squares,
 * circles, triangles or diamonds. Each style has its own entry point, such as
 * `seedkin/botling`; this one holds what they share.
 *
 * @packageDocumentation
 */
export { CENTER, GRID_SIZE, SMALL_GRID_SIZE } from './core/canvas.js';
export { FRAMES } from './core/render/frame.js';
export { LOOKS } from './core/render/look.js';
export { randomSeed } from './core/seed.js';
export type { Detail, Frame, Look, Palette, RoleGrid, Shape } from './core/types.js';
export { Role } from './core/types.js';
