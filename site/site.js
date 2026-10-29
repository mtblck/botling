// The playground. Imports botling straight from the package build (copied to /lib by
// scripts/site.mjs), so the page always shows what npm ships. State lives in the URL
// hash, which never reaches the server or analytics: seeds stay in the browser.
import { botling, PALETTES, SHAPES } from '/lib/index.js';
import { randomSeed } from '/words.js';

const $ = (id) => document.getElementById(id);
const state = { seed: '', shape: 'auto', palette: 'auto', grid: 'auto' };

/** Options for botling() from the current state, leaving out anything on auto. */
function options(extra = {}) {
  const o = { ...extra };
  if (state.shape !== 'auto') o.shape = state.shape;
  if (state.palette !== 'auto') o.palette = Number(state.palette);
  if (state.grid !== 'auto') o.showGrid = state.grid === 'on';
  return o;
}

/** The call a developer would write for the robot on screen. */
function snippet() {
  const o = options();
  const args = Object.entries(o).map(([k, v]) => `${k}: ${JSON.stringify(v).replaceAll('"', "'")}`);
  const seed = JSON.stringify(state.seed).replaceAll("'", "\\'").replace(/^"|"$/g, "'");
  return `botling(${seed}${args.length ? `, { ${args.join(', ')} }` : ''})`;
}

function draw() {
  $('big').innerHTML = botling(state.seed, options({ size: 240, title: null }));
  $('sizes').innerHTML = [96, 48, 32, 24]
    .map((size) => `<li>${botling(state.seed, options({ size, title: null }))}<span>${size}px</span></li>`)
    .join('');
  $('code').textContent = snippet();
  for (const input of document.querySelectorAll('.choices input')) input.checked = state[input.name] === input.value;
  const hash = new URLSearchParams();
  hash.set('seed', state.seed);
  for (const k of ['shape', 'palette', 'grid']) if (state[k] !== 'auto') hash.set(k, state[k]);
  history.replaceState(null, '', `#${hash}`);
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

function swatch(p) {
  return `<i class="sw" aria-hidden="true"><b data-c="${p.bg}"></b><b data-c="${p.body}"></b><b data-c="${p.glow}"></b><b data-c="${p.accent}"></b></i>`;
}

radios($('shapes'), 'shape', [['auto', 'Seed picks'], ...SHAPES.map((s) => [s, s[0].toUpperCase() + s.slice(1)])]);
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
  } catch {
    say(`Couldn't copy the ${what.toLowerCase()}; select it and copy instead`);
  }
}

function gallery() {
  const seeds = Array.from({ length: 28 }, randomSeed);
  $('gallery').innerHTML = seeds
    .map(
      (s) =>
        `<li><button type="button" data-seed="${s}" aria-label="Try ${s}">${botling(s, { size: 64, title: null })}</button></li>`,
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
  $('seed').scrollIntoView({ behavior: 'smooth', block: 'center' });
});
$('copy-code').addEventListener('click', () => copy(snippet(), 'Code'));
$('copy-svg').addEventListener('click', () => copy(botling(state.seed, options()), 'SVG'));
$('download').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([botling(state.seed, options())], { type: 'image/svg+xml' }));
  const a = Object.assign(document.createElement('a'), {
    href: url,
    download: `botling-${state.seed.slice(0, 40) || 'robot'}.svg`,
  });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
document.querySelector('.theme').addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem('botling-theme', next);
  } catch {
    /* storage blocked: the choice lasts for this page only */
  }
});

const fromHash = new URLSearchParams(location.hash.slice(1));
state.seed = fromHash.get('seed') ?? randomSeed();
for (const k of ['shape', 'palette', 'grid']) {
  const v = fromHash.get(k);
  if (v && document.querySelector(`.choices input[name="${k}"][value="${CSS.escape(v)}"]`)) state[k] = v;
}
$('seed').value = state.seed;
draw();
gallery();
