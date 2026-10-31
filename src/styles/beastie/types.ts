import type { CommonOptions } from '../../core/options.js';
import type { Palette, Shape } from '../../core/types.js';

export type { Detail, Frame, Look, Palette, RoleGrid, Shape } from '../../core/types.js';
export { Role } from '../../core/types.js';

export type Body = 'blob' | 'tall' | 'wide' | 'ghost' | 'box';
export type Eyes = 'one' | 'two' | 'three' | 'stalks' | 'tiny';
export type Mouth = 'fangs' | 'toothy' | 'grin' | 'o' | 'tongue';
export type Top = 'none' | 'horns' | 'antennae' | 'spikes' | 'tuft';
export type Sides = 'none' | 'arms' | 'wings';

/** Every choice that makes up one Beastie. */
export interface BeastieTraits {
  /** Index into `PALETTES`. */
  palette: number;
  body: Body;
  eyes: Eyes;
  mouth: Mouth;
  top: Top;
  sides: Sides;
  /** Body half-width in cells, not counting the centre column. */
  halfWidth: number;
  hasSpots: boolean;
  shape: Shape;
}

/** Options for `beastie()`. */
export interface BeastieOptions extends CommonOptions {
  /** Cell shape. Default: picked by the seed. */
  shape?: Shape;
  /** Index into `PALETTES`, or a palette object with hex colours. Default: picked by the seed. */
  palette?: number | Palette;
}
