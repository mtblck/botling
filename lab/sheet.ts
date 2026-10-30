/**
 * Writes a quick contact sheet of every prototype family, for iterating on
 * the art. Usage: npx tsx lab/sheet.ts out.html [count]
 */
import { writeFileSync } from 'node:fs';
import { botling } from '../src/index.js';
import { animal } from './kinds/animal.js';
import type { Kind } from './kinds/art.js';
import { dino } from './kinds/dino.js';
import { monster } from './kinds/monster.js';
import { person } from './kinds/person.js';
import { renderKind } from './render.js';

const out = process.argv[2] ?? 'lab-sheet.html';
const count = Number(process.argv[3] ?? 24);
const seeds = Array.from({ length: count }, (_, i) => `seed-${i}`);
const row = <T>(k: Kind<T>, size: number): string =>
  `<div class="row">${seeds.map((s) => renderKind(k, s, { size })).join('')}</div>`;
const sheet = <T>(k: Kind<T>): string => `<h3>${k.name}</h3>${row(k, 64)}${row(k, 24)}`;

let html =
  '<!doctype html><meta charset="utf-8"><style>body{font:12px system-ui;background:#eee;margin:8px}.row{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0}</style>';
html += `<h3>Robots</h3><div class="row">${seeds.map((s) => botling(s, { size: 64, frame: 'rounded' })).join('')}</div>`;
html += sheet(animal) + sheet(person) + sheet(monster) + sheet(dino);
writeFileSync(out, html);
console.log(`wrote ${out}`);
