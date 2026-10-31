/**
 * A still contact sheet of sprites by element, plus every frame of each form,
 * for iterating on the art. Usage: npx tsx lab/sprites/sheet.ts out.html
 */
import { writeFileSync } from 'node:fs';
import { stillSvg } from '../../src/core/render/svg.js';
import { ELEMENTS, type Element, sprite, spriteCells, spriteTraits } from './sprite.js';

const out = process.argv[2] ?? 'sprites-sheet.html';
const seeds = Array.from({ length: 16 }, (_, i) => `s${i}`);
let html =
  '<!doctype html><meta charset="utf-8"><style>body{font:12px system-ui;background:#888;margin:8px}div{display:flex;gap:6px;align-items:end;margin:4px 0;flex-wrap:wrap}</style>';
for (const el of Object.keys(ELEMENTS) as Element[]) {
  html += `<b>${el}</b><div>${seeds.map((s) => sprite(s, { element: el, size: 72, frame: 'rounded' })).join('')}</div>`;
  html += `<div>${seeds.map((s) => sprite(s, { element: el, size: 24, frame: 'rounded' })).join('')}</div>`;
  for (const form of ELEMENTS[el].forms) {
    let t = spriteTraits('x', el);
    for (let i = 0; t.form !== form; i++) t = spriteTraits(`x${i}`, el);
    const frame = (f: number, small: boolean, size: number): string =>
      stillSvg(
        { cells: spriteCells(t, f, small), shape: 'square', palette: t.palette, background: true, title: null },
        { size, isSmall: small, showGrid: false, frame: 'rounded', look: 'gapped', animate: false },
      );
    html += `<div>${form}: ${[0, 1, 2, 3].map((f) => frame(f, false, 72)).join('')} ${[0, 1, 2, 3].map((f) => frame(f, true, 32)).join('')}</div>`;
  }
}
writeFileSync(out, html);
