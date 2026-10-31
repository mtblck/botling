import { describe, expect, it } from 'vitest';
import type { Canvas } from '../src/core/canvas.js';
import { drawGrid as beastieGrid } from '../src/styles/beastie/grid/full.js';
import { drawSmallGrid as beastieSmall } from '../src/styles/beastie/grid/small.js';
import { resolveTraits as beastieTraits } from '../src/styles/beastie/index.js';
import { drawGrid as botlingGrid, drawSmallGrid as botlingSmall } from '../src/styles/botling/grid/index.js';
import { resolveTraits as botlingTraits } from '../src/styles/botling/index.js';
import { drawGrid as nogginGrid } from '../src/styles/noggin/grid/full.js';
import { drawSmallGrid as nogginSmall } from '../src/styles/noggin/grid/small.js';
import { resolveTraits as nogginTraits } from '../src/styles/noggin/index.js';
import { drawGrid as snootGrid } from '../src/styles/snoot/grid/full.js';
import { drawSmallGrid as snootSmall } from '../src/styles/snoot/grid/small.js';
import { resolveTraits as snootTraits } from '../src/styles/snoot/index.js';

const SEEDS = Array.from({ length: 500 }, (_, i) => `joined-${i}`);

/** Cells where an eye touches a mouth cell of the same role, so one glyph would move in two parts. */
function splitGlyphs(c: Canvas): number {
  let n = 0;
  c.parts.forEach((row, y) => {
    row.forEach((part, x) => {
      if (part !== 'eyes') return;
      for (const [nx, ny] of [
        [x + 1, y],
        [x, y + 1],
        [x - 1, y],
        [x, y - 1],
      ] as const)
        if (c.parts[ny]?.[nx] === 'mouth' && c.cells[ny]?.[nx] === c.cells[y]?.[x]) n++;
    });
  });
  return n;
}

/** A style's traits and its full and small grids. */
type Style = [string, (seed: string) => unknown, (t: never) => Canvas, (t: never) => Canvas];

describe.each<Style>([
  ['botling', botlingTraits, botlingGrid, botlingSmall],
  ['snoot', snootTraits, snootGrid, snootSmall],
  ['noggin', nogginTraits, nogginGrid, nogginSmall],
  ['beastie', beastieTraits, beastieGrid, beastieSmall],
])('%s eyes and mouth', (_, traits, full, small) => {
  it('never share a glyph, so blinking and talking never split one', () => {
    for (const seed of SEEDS) {
      const t = traits(seed) as never;
      expect(splitGlyphs(full(t)) + splitGlyphs(small(t)), seed).toBe(0);
    }
  });
});
