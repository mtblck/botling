/**
 * Writes preview.html: a contact sheet of robots at several sizes and in
 * every cell shape, for eyeballing art changes. Usage: npm run preview [count]
 */
import { writeFileSync } from 'node:fs';
import { botling, SHAPES } from '../src/index.js';

const count = Number(process.argv[2] ?? 24);
const sizes = [24, 48, 96];
const seeds = Array.from({ length: count }, (_, i) => `seed-${i}`);

const rows = SHAPES.map((shape) => {
  const bySize = sizes
    .map((size) => `<div class="row">${seeds.map((s) => botling(s, { shape, size })).join('')}</div>`)
    .join('');
  return `<h2>${shape}</h2>${bySize}`;
}).join('');

const html = `<!doctype html><meta charset="utf-8"><title>botling preview</title>
<style>body{font:14px system-ui;margin:16px;background:#fff}.row{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}
svg{border-radius:20%}h2{margin:16px 0 4px;font-size:15px}</style>${rows}`;
writeFileSync('preview.html', html);
console.log(`wrote preview.html (${seeds.length} seeds x ${sizes.length} sizes x ${SHAPES.length} shapes)`);
