/**
 * Builds the families comparison page: bundles lab/browser.ts and inlines it
 * into lab/page.html. Usage: node lab/page.mjs [out.html]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { buildSync } from 'esbuild';

const out = process.argv[2] ?? 'lab-families.html';
const { outputFiles } = buildSync({
  entryPoints: ['lab/browser.ts'],
  bundle: true,
  format: 'iife',
  globalName: 'Lab',
  minify: true,
  target: 'es2020',
  write: false,
});
const page = readFileSync('lab/page.html', 'utf8').replace('/*LAB*/', () => outputFiles[0].text);
writeFileSync(out, page);
console.log(`wrote ${out}`);
