import type { Detail, Frame, Palette, Shape } from '../../core/types.js';

export type { Detail, Frame, Palette, RoleGrid, Shape } from '../../core/types.js';
export { Role } from '../../core/types.js';

/** Every choice that makes up one robot. */
export interface Traits {
  palette: number;
  head: Head;
  eyes: Eyes;
  mouth: Mouth;
  top: Top;
  sides: Sides;
  /** Head half-width in cells, not counting the centre column. */
  halfWidth: number;
  topRow: number;
  bottomRow: number;
  hasScreen: boolean;
  hasShoulders: boolean;
  hasCheeks: boolean;
  /** Cells between the centre column and each eye. */
  eyeGap: number;
  shape: Shape;
  /** Markings on the head around the face. */
  pattern: Pattern;
  /** A one-sided touch, so the robot isn't perfectly mirrored. */
  quirk: Quirk;
  /** Something worn on the head. It takes the place of the top piece, the sides, or both. */
  accessory: Accessory;
  /** A light in the middle of the chest; drawn only with shoulders. */
  hasChestLight: boolean;
}

export type Head = 'box' | 'rounded' | 'dome' | 'tv' | 'capsule' | 'bucket' | 'wedge';
export type Eyes =
  | 'dot'
  | 'block'
  | 'tall'
  | 'slit'
  | 'visor'
  | 'cyclops'
  | 'ring'
  | 'cross'
  | 'sleepy'
  | 'mismatch'
  | 'happy'
  | 'wink'
  | 'angry'
  | 'surprised';
export type Mouth =
  | 'line'
  | 'grille'
  | 'smile'
  | 'teeth'
  | 'dots'
  | 'speaker'
  | 'none'
  | 'o'
  | 'frown'
  | 'grin'
  | 'zigzag';
export type Top = 'none' | 'antenna' | 'twin' | 'horns' | 'fin' | 'bolt' | 'dish';
export type Sides = 'none' | 'bolts' | 'ears' | 'handles';
export type Pattern = 'none' | 'stripe' | 'rivets' | 'chin';
export type Quirk = 'none' | 'ear' | 'dent' | 'patch' | 'antenna';
export type Accessory = 'none' | 'headphones' | 'visor' | 'bow' | 'cap';

/** Options for {@link botling}. */
export interface BotlingOptions {
  /** Cell shape. Defaults to the one the seed picks. */
  shape?: Shape;
  /**
   * Palette: an index into {@link PALETTES}, or a palette object such as one
   * of {@link HOLIDAY_PALETTES} or your own (colours as hex, e.g. `#1d1210`).
   * Defaults to the one the seed picks.
   */
  palette?: number | Palette;
  /**
   * Draw the empty grid cells behind the robot. `'auto'` (the default) draws
   * them at 40px and up, where they read as texture rather than noise. The
   * small robot never draws them.
   */
  showGrid?: boolean | 'auto';
  /**
   * How much detail to draw. `'full'` is the 15x15 robot. `'small'` is a
   * simpler 9x9 robot from the same traits, with cells that touch, which
   * reads at 24px. `'auto'` (the default) picks `'small'` below 40px.
   */
  detail?: Detail;
  /** Draw the background. Defaults to true. */
  background?: boolean;
  /**
   * The outline of the background. `'square'` (the default) fills the image.
   * `'rounded'` has corners a fifth of its width, `'squircle'` is a smooth
   * app-icon curve with the robot drawn a little smaller to fit, and
   * `'circle'` crops the robot to a circle, shoulders and all. The corners
   * outside the frame are transparent, and the grid keeps only whole cells.
   */
  frame?: Frame;
  /** Width and height in pixels. Defaults to 96. */
  size?: number;
  /** Accessible name. Defaults to "Robot avatar". Pass `null` to mark the image decorative. */
  title?: string | null;
  /**
   * Bring the robot to life with a small CSS animation inside the SVG: it
   * hovers, blinks and talks, its top piece wobbles, its ears or handles
   * twitch and a scanline sweeps its screen. Below 40px it only blinks and
   * hovers. It holds still for anyone who prefers
   * reduced motion, and the still frame is the robot drawn without it.
   * Defaults to false.
   */
  animate?: boolean;
}
