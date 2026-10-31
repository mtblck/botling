/**
 * A static contact sheet of every sprite form and frame, for iterating on the
 * art. Usage: npx tsx lab/sprites/sheet.ts out.html
 */
import { writeFileSync } from 'node:fs';
import { stillSvg } from '../../src/core/render/svg.js';
import { FULL } from './full.js';
import { SMALL } from './small.js';
import { ELEMENTS, type Element } from './sprite.js';

const out = process.argv[2] ?? 'sprites-sheet.html';
let html =
  '<!doctype html><meta charset="utf-8"><style>body{font:12px system-ui;background:#888;margin:8px}div{display:flex;gap:6px;align-items:end;margin:4px 0}</style>';
for (const [el, { forms, palettes }] of Object.entries(ELEMENTS) as [Element, (typeof ELEMENTS)[Element]][]) {
  for (const form of forms) {
    html += `<b>${el} / ${form}</b><div>`;
    for (const eyes of [false, true]) {
      for (const [set, size] of [
        [FULL, 96],
        [SMALL, 48],
        [SMALL, 24],
      ] as const) {
        for (let f = 0; f < 4; f++) {
          const cells = set[form](f, eyes).cells;
          html += stillSvg(
            { cells, shape: 'square', palette: palettes[f % 3]!, background: true, title: null },
            { size, isSmall: set === SMALL, showGrid: false, frame: 'rounded', look: 'gapped', animate: false },
          );
        }
      }
    }
    html += '</div>';
  }
}
writeFileSync(out, html);
