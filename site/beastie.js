// The Beastie playground: a smaller cousin of botling.js, drawn from the package build at
// /lib. State lives in the URL hash, which never reaches the server or analytics.
import {
  beastie,
  beastieDataUri,
  FRAMES,
  PALETTES,
  randomSeed,
  resolveTraits,
  SHAPES,
} from '/lib/styles/beastie/index.js';
import { options as optionsFor, snippet as snippetFor } from '/snippet.js';
import { track } from '/track.js';

const $ = (id) => document.getElementById(id);
const DEFAULTS = { shape: 'auto', frame: 'square', palette: 'auto', grid: 'auto' };
const KEYS = Object.keys(DEFAULTS);
const state = { seed: '', ...DEFAULTS };
const options = (extra) => optionsFor(state, extra);
const snippet = () => snippetFor(state, 'beastie');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const title = (s) => s[0].toUpperCase() + s.slice(1);

/** Names the big Beastie for screen readers, so a change of seed or option is heard. */
function describe() {
  const t = resolveTraits(state.seed, options());
  const eyes = { one: 'one eye', two: 'two eyes', three: 'three eyes', stalks: 'eyes on stalks', tiny: 'tiny eyes' };
  const parts = [
    `${t.shape} cells`,
    `${PALETTES[t.palette].name} hide`,
    eyes[t.eyes],
    `a ${t.mouth === 'o' ? 'round' : t.mouth} mouth`,
  ];
  if (t.top !== 'none') parts.push(t.top);
  if (t.sides !== 'none') parts.push(t.sides);
  if (t.hasSpots) parts.push('spots');
  return `Beastie for "${state.seed}": a ${t.body} body, ${parts.join(', ')}`;
}

// Safari throttles history calls, so typing updates the hash in a debounce.
let hashTimer;
function saveHash() {
  clearTimeout(hashTimer);
  hashTimer = setTimeout(() => {
    const hash = new URLSearchParams({ seed: state.seed });
    for (const k of KEYS) if (state[k] !== DEFAULTS[k]) hash.set(k, state[k]);
    try {
      history.replaceState(null, '', `#${hash}`);
    } catch {
      /* throttled or blocked: only the link lags */
    }
  }, 300);
}

function draw() {
  $('big').innerHTML = beastie(state.seed, options({ size: 240, title: null }));
  $('big').setAttribute('aria-label', describe());
  $('sizes').innerHTML = [96, 48, 32, 24]
    .map((size) => `<li>${beastie(state.seed, options({ size, title: null }))}<span>${size}px</span></li>`)
    .join('');
  $('code').textContent = snippet();
  for (const input of document.querySelectorAll('.choices input')) input.checked = state[input.name] === input.value;
  saveHash();
}

/** Builds a radio group. Each choice is [value, label, extra HTML inside the label]. */
function radios(container, name, choices) {
  container.innerHTML = choices
    .map(([value, label, art = '']) => {
      const id = `${name}-${value}`;
      return `<input type="radio" name="${name}" id="${id}" value="${value}"><label for="${id}">${art}<span>${label}</span></label>`;
    })
    .join('');
  container.addEventListener('change', (e) => {
    state[name] = e.target.value;
    draw();
  });
}
const swatch = (p) =>
  `<i class="sw" aria-hidden="true"><b data-c="${p.bg}"></b><b data-c="${p.body}"></b><b data-c="${p.screen}"></b><b data-c="${p.accent}"></b></i>`;
radios($('shapes'), 'shape', [['auto', 'Seed picks'], ...SHAPES.map((s) => [s, title(s)])]);
radios(
  $('frames'),
  'frame',
  FRAMES.map((f) => [f, title(f)]),
);
radios($('palettes'), 'palette', [['auto', 'Seed picks'], ...PALETTES.map((p, i) => [String(i), p.name, swatch(p)])]);
radios($('grids'), 'grid', [
  ['auto', 'Auto'],
  ['on', 'On'],
  ['off', 'Off'],
]);
// Swatch colours go in through the CSSOM, which the CSP allows, rather than style attributes.
for (const b of document.querySelectorAll('.sw b')) b.style.background = b.dataset.c;

let statusTimer;
function say(text) {
  $('status').textContent = text;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => ($('status').textContent = ''), 2500);
}
async function copy(text, what) {
  try {
    await navigator.clipboard.writeText(text);
    say(`${what} copied`);
    track('copied');
  } catch {
    say(`Couldn't copy the ${what.toLowerCase()}; select it and copy instead`);
  }
}

function gallery() {
  $('gallery').innerHTML = Array.from({ length: 28 }, () => randomSeed())
    .map(
      (s) =>
        `<li><button type="button" data-seed="${s}" aria-label="Try ${s}"><img src="${beastieDataUri(s, { size: 64, title: null })}" alt="" width="64" height="64"></button></li>`,
    )
    .join('');
}

$('seed').addEventListener('input', (e) => {
  state.seed = e.target.value;
  draw();
});
$('seed-form').addEventListener('submit', (e) => e.preventDefault());
$('random').addEventListener('click', () => {
  state.seed = $('seed').value = randomSeed();
  draw();
});
$('shuffle').addEventListener('click', gallery);
$('gallery').addEventListener('click', (e) => {
  const button = e.target.closest('button[data-seed]');
  if (!button) return;
  state.seed = $('seed').value = button.dataset.seed;
  draw();
  $('seed').focus({ preventScroll: true });
  $('seed').scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'center' });
  say(`Showing ${button.dataset.seed}`);
});
$('copy-code').addEventListener('click', () => copy(snippet(), 'Code'));
$('copy-svg').addEventListener('click', () => copy(beastie(state.seed, options()), 'SVG'));
$('download').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([beastie(state.seed, options())], { type: 'image/svg+xml' }));
  Object.assign(document.createElement('a'), {
    href: url,
    download: `beastie-${state.seed.slice(0, 40) || 'beastie'}.svg`,
  }).click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  track('downloaded');
});

function readHash() {
  const fromHash = new URLSearchParams(location.hash.slice(1));
  state.seed = fromHash.get('seed')?.replace(/[\r\n]+/g, '') ?? randomSeed();
  for (const k of KEYS) {
    const v = fromHash.get(k);
    state[k] = v && document.querySelector(`.choices input[name="${k}"][value="${CSS.escape(v)}"]`) ? v : DEFAULTS[k];
  }
  $('seed').value = state.seed;
  draw();
}
window.addEventListener('hashchange', readHash);
readHash();
gallery();
