/**
 * Writes docs/hero.svg, the README banner: one row of robots per cell shape.
 * Usage: npm run hero
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { botling, SHAPES } from '../src/index.js';

const SIZE = 72;
const GAP = 12;
const PER_ROW = 8;
const seeds = ['ada', 'bolt', 'cog', 'dot', 'echo', 'flux', 'gizmo', 'hex'];

const width = PER_ROW * SIZE + (PER_ROW - 1) * GAP;
const height = SHAPES.length * SIZE + (SHAPES.length - 1) * GAP;
const bots = SHAPES.flatMap((shape, row) =>
  seeds.slice(0, PER_ROW).map((seed, col) => {
    const svg = botling(`${seed}-${shape}`, { shape, size: SIZE, title: null });
    const x = col * (SIZE + GAP);
    const y = row * (SIZE + GAP);
    return svg.replace('<svg ', `<svg x="${x}" y="${y}" `);
  }),
);

mkdirSync('docs', { recursive: true });
writeFileSync(
  'docs/hero.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Rows of botling robots drawn with square, circle, triangle and diamond cells">${bots.join('')}</svg>\n`,
);
console.log('wrote docs/hero.svg');
