/**
 * Writes a contact sheet of every family in every look, for comparing render
 * styles. Usage: npx tsx lab/looks/sheet.ts out.html [count]
 */
import { writeFileSync } from 'node:fs';
import { FAMILIES } from './families.js';
import { LOOKS, renderLook } from './render.js';

const out = process.argv[2] ?? 'lab-looks.html';
const count = Number(process.argv[3] ?? 8);
const seeds = Array.from({ length: count }, (_, i) => `seed-${i}`);
let html =
  '<!doctype html><meta charset="utf-8"><style>body{font:12px system-ui;background:#eee;margin:8px}.row{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0 12px}h3{margin:16px 0 0}</style>';
for (const { name, kind } of FAMILIES) {
  html += `<h2>${name}</h2>`;
  for (const look of LOOKS) {
    html += `<h3>${look}</h3><div class="row">${seeds.map((s) => renderLook(kind, s, look, { size: 96, shape: 'square' })).join('')}</div>`;
  }
}
writeFileSync(out, html);
console.log(`wrote ${out}`);
