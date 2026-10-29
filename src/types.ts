/** The cell shape a robot is drawn with. */
export type Shape = 'square' | 'circle' | 'triangle';

/** How much detail a robot is drawn with. See {@link BotlingOptions.detail}. */
export type Detail = 'auto' | 'full' | 'small';

/**
 * What a grid cell is part of. Each role maps to one palette colour, so a
 * palette can restyle a robot without touching its layout.
 */
export const Role = {
  Empty: 0,
  Body: 1,
  Screen: 2,
  Glow: 3,
  Accent: 4,
  Shade: 5,
} as const;
export type Role = (typeof Role)[keyof typeof Role];

/** A grid of roles, indexed `[row][column]`. */
export type RoleGrid = Role[][];

/** The colours one robot is painted with. All values are CSS colours. */
export interface Palette {
  name: string;
  /** Square behind the robot. */
  bg: string;
  /** Empty grid cells, when the grid is shown. */
  grid: string;
  body: string;
  /** Body edge, ears and neck. */
  shade: string;
  /** Face screen behind the eyes and mouth. */
  screen: string;
  /** Eyes and mouth on a screen. */
  glow: string;
  /** Antenna tips, bolts, cheeks and other details. */
  accent: string;
}

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
}

export type Head = 'box' | 'rounded' | 'dome' | 'tv' | 'capsule' | 'bucket' | 'wedge';
export type Eyes = 'dot' | 'block' | 'tall' | 'slit' | 'visor' | 'cyclops' | 'ring' | 'cross' | 'sleepy' | 'mismatch';
export type Mouth = 'line' | 'grille' | 'smile' | 'teeth' | 'dots' | 'speaker' | 'none' | 'o';
export type Top = 'none' | 'antenna' | 'twin' | 'horns' | 'fin' | 'bolt' | 'dish';
export type Sides = 'none' | 'bolts' | 'ears' | 'handles';

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
  /** Draw the background square. Defaults to true. */
  background?: boolean;
  /** Width and height in pixels. Defaults to 96. */
  size?: number;
  /** Accessible name. Defaults to "Robot avatar". Pass `null` to mark the image decorative. */
  title?: string | null;
}
