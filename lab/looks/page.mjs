/**
 * Builds the render looks comparison page: bundles lab/looks/browser.ts and
 * inlines it into lab/looks/page.html. Usage: node lab/looks/page.mjs [out.html]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { buildSync } from 'esbuild';

const out = process.argv[2] ?? 'lab-looks.html';
const { outputFiles } = buildSync({
  entryPoints: ['lab/looks/browser.ts'],
  bundle: true,
  format: 'iife',
  globalName: 'Looks',
  minify: true,
  target: 'es2020',
  write: false,
});
const page = readFileSync('lab/looks/page.html', 'utf8').replace('/*LOOKS*/', () => outputFiles[0].text);
writeFileSync(out, page);
console.log(`wrote ${out}`);
