import { FRAMES } from './render/frame.js';
import { LOOKS } from './render/look.js';
import type { Detail, Frame, Look, Palette } from './types.js';

/** Options every style's renderer takes, besides its own `shape` and `palette`. */
export interface CommonOptions {
  /** Width and height in pixels. Default 96. */
  size?: number;
  /** `'auto'` draws the simpler 9x9 avatar below 40px. Default `'auto'`. */
  detail?: Detail;
  /**
   * How cells are drawn. `'gapped'` (the default) draws separate cells; the
   * others close the gap so cells merge into flat shapes: `'flat'`,
   * `'inked'` with a dark outline, `'soft'` with rounded corners,
   * `'soft-inked'` and `'sticker'`.
   */
  look?: Look;
  /** Draw the empty grid cells. `'auto'` draws them from 40px up. Only the gapped look has a grid. */
  showGrid?: boolean | 'auto';
  /** The outline of the background. Default `'square'`. */
  frame?: Frame;
  /** Draw the palette's background. Default true. */
  background?: boolean;
  /** Accessible name; `null` marks the image decorative. */
  title?: string | null;
}

/** {@link CommonOptions} checked and settled for one render. */
export interface Settled {
  size: number;
  isSmall: boolean;
  showGrid: boolean;
  frame: Frame;
  look: Look;
}

/** Below this size the 15x15 avatar reads as noise, so `'auto'` draws the small one without its grid. */
export const AUTO_FULL_MIN_SIZE = 40;
const DETAILS: readonly Detail[] = ['auto', 'full', 'small'];

/**
 * Checks the shared options, throwing a `RangeError` named for the style
 * rather than drawing nothing, and settles the `'auto'` ones for the size.
 *
 * @param style - The style's name, for error messages
 * @param opts - Caller options
 * @returns Size, detail, grid, frame and look to draw with
 */
export function settle(style: string, opts: CommonOptions): Settled {
  const size = opts.size ?? 96;
  if (typeof size !== 'number' || !Number.isFinite(size) || size <= 0) {
    throw new RangeError(`${style}: size must be a positive, finite number`);
  }
  const detail = opts.detail ?? 'auto';
  if (!DETAILS.includes(detail)) throw new RangeError(`${style}: unknown detail "${String(detail)}"`);
  const isSmall = detail === 'small' || (detail === 'auto' && size < AUTO_FULL_MIN_SIZE);
  const auto = opts.showGrid === 'auto' || opts.showGrid === undefined;
  const look = opts.look ?? 'gapped';
  if (!LOOKS.includes(look)) throw new RangeError(`${style}: unknown look "${String(look)}"`);
  const showGrid = !isSmall && look === 'gapped' && (auto ? size >= AUTO_FULL_MIN_SIZE : opts.showGrid === true);
  const frame = opts.frame ?? 'square';
  if (!FRAMES.includes(frame)) throw new RangeError(`${style}: unknown frame "${String(frame)}"`);
  return { size, isSmall, showGrid, frame, look };
}

const HEX = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const PALETTE_KEYS = ['bg', 'grid', 'body', 'shade', 'screen', 'glow', 'accent'] as const;

/**
 * Checks a caller's palette object. Its colours go straight into SVG
 * attributes, so anything but a hex colour is rejected; each is read once
 * into a copy, so a getter can't pass the check and then change.
 *
 * @param style - The style's name, for error messages
 * @param custom - The palette option, already known to be an object
 * @returns A checked copy
 */
export function checkPalette(style: string, custom: object | null): Palette {
  if (custom === null || Array.isArray(custom)) {
    throw new RangeError(`${style}: palette must be an index into PALETTES or a palette object`);
  }
  const source = custom as Record<string, unknown>;
  const checked = { name: String(source.name ?? 'Custom') } as Palette;
  for (const key of PALETTE_KEYS) {
    const colour = source[key];
    if (typeof colour !== 'string' || !HEX.test(colour)) {
      throw new RangeError(`${style}: palette.${key} must be a hex colour such as #1d1210`);
    }
    checked[key] = colour;
  }
  return checked;
}
