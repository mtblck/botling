/**
 * The Sprites concept page: every element and form, animated, at every size,
 * next to the other families. Usage: npx tsx lab/sprites/page.ts out.html
 */
import { readFileSync, writeFileSync } from 'node:fs';
import type { Look } from '../../src/core/types.js';
import { beastie } from '../../src/styles/beastie/index.js';
import { botling } from '../../src/styles/botling/index.js';
import { noggin } from '../../src/styles/noggin/index.js';
import { snoot } from '../../src/styles/snoot/index.js';
import { ELEMENTS, type Element, sprite, spriteTraits } from './sprite.js';

const out = process.argv[2] ?? 'sprites.html';
const tpl = readFileSync(new URL('./page.html', import.meta.url), 'utf8');

/** The first seed that draws this element in this form and palette. */
const find = (el: Element, form: string, pal: number): string => {
  const want = ELEMENTS[el].palettes[pal]?.name;
  for (let i = 0; ; i++) {
    const t = spriteTraits(`kin-${i}`, el);
    if (t.form === form && t.palette.name === want) return `kin-${i}`;
  }
};

const NOTES: Record<Element, { verdict: string; tone: string; note: string }> = {
  fire: {
    verdict: 'Reads at 24px',
    tone: 'good',
    note: 'The flame outline plus warm colour is a symbol everyone knows, and when animated the tip sways and embers drift up.',
  },
  space: {
    verdict: 'Reads at 24px',
    tone: 'good',
    note: 'A ringed planet and a four-point star are both icons people already know. Twinkling stars in the corners are the lightning bugs.',
  },
  water: {
    verdict: 'Drop reads, blob is iffy',
    tone: 'ok',
    note: 'The drop works at every size because of its point and highlight. The round blob reads as a blue ball or a slime: only the colour says water.',
  },
  earth: {
    verdict: 'Fine at 48px, faint at 24px',
    tone: 'ok',
    note: 'A rock is a lump until the sprout tells you it is earth, and at 24px the sprout is two pixels. The gem only works in gem colours.',
  },
  wind: {
    verdict: 'Weakest',
    tone: 'weak',
    note: 'Air has no outline. The puff reads as a cloud only thanks to its speed lines, and the funnel can look like a tooth at 24px. Wind leans on motion more than any other element.',
  },
};

const order: Element[] = ['fire', 'water', 'earth', 'wind', 'space'];

const elements = order
  .map((el) => {
    const { forms } = ELEMENTS[el];
    const n = NOTES[el];
    const big = forms
      .map((form, k) => {
        const seed = find(el, form, k);
        const strip = [48, 32, 24].map((size) => sprite(seed, { size, element: el, animate: true })).join('');
        return `<figure class="form">${sprite(seed, { size: 120, element: el, animate: true })}<div class="strip">${strip}</div><figcaption>${form}</figcaption></figure>`;
      })
      .join('');
    return `<article class="el"><header><h3>${el[0]?.toUpperCase()}${el.slice(1)}</h3><span class="chip ${n.tone}">${n.verdict}</span></header><div class="forms">${big}</div><p>${n.note}</p></article>`;
  })
  .join('');

const faceSeeds = order.flatMap((el) =>
  ELEMENTS[el].forms.map((form, k) => [el, find(el, form, (k + 1) % 3)] as const),
);
const faces = [false, true]
  .map(
    (eyes) =>
      `<div class="facerow"><span class="label">${eyes ? 'With eyes' : 'Faceless'}</span><div class="avs">${faceSeeds
        .map(([el, s]) => sprite(s, { size: 48, element: el, eyes, animate: true }))
        .join(
          '',
        )}</div><div class="avs">${faceSeeds.map(([el, s]) => sprite(s, { size: 24, element: el, eyes, animate: true })).join('')}</div></div>`,
  )
  .join('');

const famSeeds = ['ada', 'grace', 'linus', 'margaret', 'tim', 'radia', 'ken', 'barbara'];
const fam: [string, (s: string, size: number) => string][] = [
  ['Botling', (s, size) => botling(s, { size, frame: 'rounded' })],
  ['Snoot', (s, size) => snoot(s, { size, frame: 'rounded' })],
  ['Noggin', (s, size) => noggin(s, { size, frame: 'rounded' })],
  ['Beastie', (s, size) => beastie(s, { size, frame: 'rounded' })],
  ['Sprites', (s, size) => sprite(s, { size, animate: true })],
];
const family = [40, 24]
  .map(
    (size) =>
      `<div class="famgrid s${size}">${fam
        .map(
          ([name, f]) =>
            `<span class="label">${name}</span><div class="avs">${famSeeds.map((s) => f(s, size)).join('')}</div>`,
        )
        .join('')}</div>`,
  )
  .join('');

const looks: Look[] = ['gapped', 'flat', 'soft', 'sticker'];
const lookSeeds = order.map((el, i) => [el, find(el, ELEMENTS[el].forms[0], i % 3)] as const);
const looksHtml = looks
  .map(
    (look) =>
      `<span class="label">${look[0]?.toUpperCase()}${look.slice(1)}</span><div class="avs">${lookSeeds
        .map(([el, s]) => sprite(s, { size: 72, element: el, look, animate: true }))
        .join('')}</div>`,
  )
  .join('');

writeFileSync(
  out,
  tpl
    .replace('{{elements}}', elements)
    .replace('{{faces}}', faces)
    .replace('{{family}}', family)
    .replace('{{looks}}', looksHtml),
);
console.log(`wrote ${out}`);
