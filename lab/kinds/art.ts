import { blob, stamp } from '../../src/core/art.js';
import { type Canvas, createCanvas } from '../../src/core/canvas.js';
import type { Palette, Shape } from '../../src/core/types.js';
import { Role } from '../../src/core/types.js';

/** One avatar family: how a seed becomes traits, a picture and colours. */
export interface Kind<T> {
  name: string;
  /** Picks every trait for a seed. */
  traits: (seed: string) => T;
  /** Draws the 15x15 picture for a set of traits. */
  draw: (t: T) => Canvas;
  /** The colours the traits name. */
  palette: (t: T) => Palette;
  /** The cell shape the traits name. */
  shape: (t: T) => Shape;
  /** A short description of the traits, for the comparison page. */
  describe: (t: T) => string;
}

export type { Canvas };
export { blob, createCanvas, Role, stamp };
