import { blob } from '../../../core/art.js';
import { type Canvas, createCanvas, SMALL_GRID_SIZE } from '../../../core/canvas.js';
import { type BeastieTraits, Role } from '../types.js';

/** Row half-widths of each body on the 9x9 grid, and its top row. */
function body(t: BeastieTraits): { top: number; rows: number[] } {
  switch (t.body) {
    case 'tall':
      return { top: 2, rows: [1, 2, 2, 2, 2, 2] };
    case 'wide':
      return { top: 3, rows: [3, 4, 4, 4, 3] };
    case 'ghost':
      return { top: 2, rows: [1, 2, 3, 3, 3, 3] };
    case 'box':
      return { top: 2, rows: [3, 3, 3, 3, 3] };
    default:
      return { top: 2, rows: [1, 2, 3, 3, 3, 2] };
  }
}

/**
 * Draws the simpler 9x9 Beastie for small sizes, from the same traits as the
 * detailed one.
 *
 * @param t - The Beastie's traits
 * @returns A 9x9 canvas
 */
export function drawSmallGrid(t: BeastieTraits): Canvas {
  const c = createCanvas(SMALL_GRID_SIZE);
  const { top, rows } = body(t);
  const hw = Math.max(...rows);
  const bottom = top + rows.length - 1;
  if (t.sides === 'wings') for (const y of [top + 1, top + 2]) c.mirror(hw + 1, y, Role.Accent);
  blob(c, top, rows, Role.Body, Role.Shade);
  if (t.sides === 'arms') c.mirror(hw + 1, top + 3, Role.Shade);
  if (t.body === 'ghost') for (const dx of [1, 3]) c.mirror(dx, bottom, Role.Empty);
  else c.mirror(Math.min(2, hw - 1), bottom + 1, Role.Shade);
  if (t.hasSpots) {
    c.paint(c.center - hw + 1, top + 3, Role.Accent);
    c.paint(c.center + hw - 1, bottom - 1, Role.Accent);
  }
  const w0 = rows[0] ?? 1;
  if (t.top === 'horns') {
    c.mirror(w0, top - 1, Role.Shade);
    c.mirror(w0 + 1, top - 2, Role.Accent);
  } else if (t.top === 'antennae') {
    c.mirror(1, top - 1, Role.Shade);
    c.mirror(1, top - 2, Role.Accent);
  } else if (t.top === 'spikes') {
    for (let dx = 0; dx <= w0; dx += 2) c.mirror(dx, top - 1, Role.Shade);
  } else if (t.top === 'tuft') {
    c.paint(c.center, top - 1, Role.Shade);
    c.paint(c.center - 1, top - 2, Role.Shade);
  }
  const eyeRow = Math.min(top + 2, bottom - 3);
  eyes(c, t, eyeRow);
  mouth(c, t, eyeRow + 2);
  return c;
}

/** Eyes: whites in glow with pupils in screen. */
function eyes(c: Canvas, t: BeastieTraits, y: number): void {
  switch (t.eyes) {
    case 'one':
      for (const dx of [-1, 0, 1]) for (const row of [y - 1, y]) c.paint(c.center + dx, row, Role.Glow);
      c.paint(c.center, y, Role.Screen);
      return;
    case 'two':
      for (const dx of [1, 2]) for (const row of [y - 1, y]) c.mirror(dx, row, Role.Glow);
      c.mirror(1, y, Role.Screen);
      return;
    case 'three':
      c.paint(c.center, y - 1, Role.Screen);
      c.mirror(1, y, Role.Glow);
      c.mirror(2, y, Role.Screen);
      return;
    case 'tiny':
      c.mirror(1, y, Role.Glow);
      return;
    case 'stalks': {
      const tip = Math.max(0, y - 4);
      for (let row = tip + 1; row < y - 1; row++) c.mirror(2, row, Role.Body);
      c.mirror(2, tip, Role.Glow);
      c.mirror(3, tip, Role.Glow);
      c.mirror(1, y, Role.Glow);
      return;
    }
  }
}

function mouth(c: Canvas, t: BeastieTraits, y: number): void {
  const line = (to: number, row = y): void => {
    for (let dx = 0; dx <= to; dx++) c.mirror(dx, row, Role.Screen);
  };
  switch (t.mouth) {
    case 'fangs':
      line(2);
      c.mirror(1, y + 1, Role.Glow);
      return;
    case 'toothy':
      line(2);
      c.mirror(0, y, Role.Glow);
      c.mirror(2, y, Role.Glow);
      return;
    case 'grin':
      line(1, y + 1);
      c.mirror(2, y, Role.Screen);
      return;
    case 'o':
      line(0);
      line(0, y + 1);
      return;
    case 'tongue':
      line(1);
      c.paint(c.center, y + 1, Role.Accent);
      return;
  }
}
