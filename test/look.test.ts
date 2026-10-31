import { describe, expect, it } from 'vitest';
import { inkFor, innerLines, silhouette } from '../src/core/render/ink.js';
import { lookCell, softExtras } from '../src/core/render/look.js';
import { pathData } from '../src/core/render/path.js';
import { beastie } from '../src/styles/beastie/index.js';
import { botling, LOOKS, SHAPES } from '../src/styles/botling/index.js';
import { noggin } from '../src/styles/noggin/index.js';
import { snoot } from '../src/styles/snoot/index.js';

const STYLES = { botling, snoot, beastie, noggin } as const;
const seeds = Array.from({ length: 60 }, (_, i) => `look-${i}`);

describe('look', () => {
  it.each(Object.entries(STYLES))('lays every shadow under every border on a moving %s sticker', (_, draw) => {
    // A moving part's shadow drawn over the body's white border showed as a grey smear (lucky-gadget-959).
    for (const seed of ['lucky-gadget-959', ...seeds.slice(0, 20)]) {
      const svg = draw(seed, { look: 'sticker', animate: true });
      expect(svg.lastIndexOf('opacity=".22"'), seed).toBeLessThan(svg.indexOf('fill="#fff" stroke="#fff"'));
    }
  });

  it.each(Object.entries(STYLES))('leaves %s exactly as it was by default', (_, draw) => {
    for (const seed of seeds.slice(0, 20)) {
      expect(draw(seed, { look: 'gapped' })).toBe(draw(seed));
      expect(draw(seed, { look: 'gapped', size: 24 })).toBe(draw(seed, { size: 24 }));
    }
  });

  it.each(LOOKS.filter((l) => l !== 'gapped'))('draws every style, shape and size in the %s look', (look) => {
    for (const [name, draw] of Object.entries(STYLES)) {
      for (const shape of SHAPES) {
        for (const size of [24, 96]) {
          const svg = draw('mtblck', { look, shape, size });
          expect(svg, `${name} ${shape} ${size}`).toMatch(/^<svg [^>]+>.*<\/svg>$/);
          expect(svg).not.toMatch(/NaN|undefined|Infinity/);
        }
      }
    }
  });

  it.each(LOOKS)('draws a known robot and Snoot in the %s look', (look) => {
    // The picture is the API: a look, once released, keeps drawing the same way.
    expect(botling('look', { look, shape: 'square' })).toMatchSnapshot();
    expect(snoot('look', { look, shape: 'square' })).toMatchSnapshot();
  });

  it('draws gapless looks without the grid, whatever showGrid says', () => {
    for (const look of LOOKS.filter((l) => l !== 'gapped')) {
      expect(botling('x', { look, showGrid: true })).toBe(botling('x', { look, showGrid: false }));
      expect(snoot('x', { look, showGrid: true })).toBe(snoot('x', { look, showGrid: false }));
    }
  });

  it('keeps moving parts with their outline when animated', () => {
    for (const look of LOOKS) {
      const svg = botling('look-3', { look, animate: true });
      expect(svg).toContain('@keyframes');
      expect(svg).not.toMatch(/NaN|undefined/);
    }
    // Inked: each moving group carries its own outline, so the outline moves with it.
    const inked = botling('look-3', { look: 'inked', animate: true, shape: 'square' });
    const groups = inked.match(/<g class="botling-[a-z0-9]+-[^"]+"[^>]*>(.*?)<\/g>/g) ?? [];
    expect(groups.some((g) => /stroke-width="\.42"/.test(g))).toBe(true);
  });

  it('rejects an unknown look', () => {
    for (const draw of Object.values(STYLES)) {
      // @ts-expect-error: not a look
      expect(() => draw('x', { look: 'neon' })).toThrow(RangeError);
    }
  });
});

describe('look geometry', () => {
  it('rounds a lone soft cell into a circle, reaching a hair past the cell', () => {
    expect(pathData([lookCell('soft', 'square', [['#f00']], 0, 0, false)])).toBe(
      'm.49-.01h.02a.5 .5 0 0 1 .5 .5v.02a.5 .5 0 0 1-.5 .5h-.02a.5 .5 0 0 1-.5-.5v-.02a.5 .5 0 0 1 .5-.5z',
    );
  });

  it('keeps a diagonal run of one colour joined at the corner', () => {
    const g = [
      ['#f00', '#00f'],
      ['#00f', '#f00'],
    ];
    // The top-left cell's outer corners round, but its corner toward the other red cell stays square.
    expect(lookCell('soft', 'square', g, 0, 0, false)).toContainEqual([1010, 1010]);
    expect(softExtras('soft', 'square', g).under.size).toBe(0);
  });

  it('keeps corners square where a run of one colour carries on', () => {
    const g = [['#f00', '#f00']];
    // The left cell rounds only its two left corners.
    expect(lookCell('soft', 'square', g, 0, 0, false).filter((p) => p.length === 3)).toHaveLength(2);
    // Other shapes and looks draw plain solid cells.
    expect(lookCell('soft', 'circle', g, 0, 0, false)).toEqual([[500, 500]]);
    expect(lookCell('flat', 'square', g, 0, 0, false)).toEqual(lookCell('gapped', 'square', g, 0, 0, true));
  });

  it('fillets an inner corner and backs a rounded corner inside the picture', () => {
    const L = [
      ['#f00', null],
      ['#f00', '#f00'],
    ];
    expect([...softExtras('soft', 'square', L).over.keys()]).toEqual(['#f00']);
    const eye = [
      ['#00f', '#00f', '#00f'],
      ['#00f', '#fff', '#00f'],
      ['#00f', '#00f', '#00f'],
    ];
    // The lone white cell rounds all four corners over blue backing.
    expect(softExtras('soft', 'square', eye).under.get('#00f')).toHaveLength(4);
    expect(softExtras('flat', 'square', eye).under.size).toBe(0);
  });

  it('keeps corners square where three or more colours meet, so no pinwheel or seam shows', () => {
    // Beastie brave-circuit-117: a spot, an eye white, the body and a pupil around one point.
    // Each cell rounds only its outer corner.
    const g = [
      ['#f0f', '#fff'],
      ['#0f0', '#000'],
    ];
    for (const [x, y] of [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ] as const)
      expect(lookCell('soft', 'square', g, x, y, false).filter((p) => p.length === 3)).toHaveLength(1);
    expect(softExtras('soft', 'square', g).under.size).toBe(0);
  });

  it('draws one ink line per run of edges between colours', () => {
    const g = [
      ['#f00', '#f00'],
      ['#00f', '#00f'],
    ];
    expect(innerLines('inked', 'square', g, '#000')).toContain('d="M0 1h2"');
    expect(innerLines('soft-inked', 'square', g, '#000')).toBe('');
    expect(innerLines('inked', 'circle', g, '#000')).toBe('');
  });

  it('outlines only the looks that have an outline', () => {
    expect(silhouette('flat', false, 'm0 0h1v1h-1z', '#000')).toBe('');
    expect(silhouette('inked', false, 'm0 0h1v1h-1z', '#000')).toContain('stroke-width=".42"');
    expect(silhouette('inked', true, 'm.5 .5h0', '#000')).toContain('stroke-width="1.42"');
    expect(silhouette('sticker', false, 'm0 0h1v1h-1z', '#000').match(/<path/g)).toHaveLength(2);
    expect(silhouette('inked', false, '', '#000')).toBe('');
  });

  it('darkens any hex colour for ink, ignoring alpha', () => {
    expect(inkFor('#ffffff')).toBe('#616161');
    expect(inkFor('#fff')).toBe('#616161');
    expect(inkFor('#fff8')).toBe('#616161');
    expect(inkFor('#ff000080')).toBe('#610000');
  });
});
