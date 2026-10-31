import type { CommonOptions } from '../../core/options.js';
import type { Palette, Shape } from '../../core/types.js';

export type { Detail, Frame, Look, Palette, RoleGrid, Shape } from '../../core/types.js';
export { Role } from '../../core/types.js';

export type Species = 'cat' | 'fox' | 'bear' | 'bunny' | 'mouse' | 'dog' | 'panda' | 'owl' | 'frog' | 'pig';
export type Eyes = 'dot' | 'tall' | 'shine' | 'sleepy' | 'happy';
export type Marking = 'none' | 'stripes' | 'patch' | 'mask' | 'spots';
export type Extra = 'none' | 'bow' | 'flower' | 'whiskers';
export type Mouth = 'smile' | 'tongue' | 'open';

/** Every choice that makes up one Snoot. */
export interface SnootTraits {
  /** Index into `PALETTES`. */
  palette: number;
  species: Species;
  eyes: Eyes;
  marking: Marking;
  extra: Extra;
  /** Head half-width in cells, not counting the centre column. */
  halfWidth: number;
  /** One more row of head. */
  isTall: boolean;
  hasCheeks: boolean;
  shape: Shape;
  mouth: Mouth;
}

/** Options for `snoot()`. */
export interface SnootOptions extends CommonOptions {
  /** Cell shape. Default: picked by the seed. */
  shape?: Shape;
  /** Index into `PALETTES`, or a palette object with hex colours. Default: picked by the seed. */
  palette?: number | Palette;
}
