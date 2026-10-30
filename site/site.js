// The playground. Imports botling straight from the package build (copied to /lib by
// scripts/site.mjs), so the page always shows what npm ships. State lives in the URL
// hash, which never reaches the server or analytics: seeds stay in the browser.
import {
  botling,
  botlingDataUri,
  FRAMES,
  HOLIDAY_PALETTES,
  PALETTES,
  randomSeed,
  resolveTraits,
  SHAPES,
} from '/lib/index.js';
import { options as optionsFor, snippet as snippetFor } from '/snippet.js';
import { arrival, track } from '/track.js';

const $ = (id) => document.getElementById(id);
const DEFAULTS = { shape: 'auto', frame: 'square', palette: 'auto', grid: 'auto', motion: 'off' };
const KEYS = Object.keys(DEFAULTS);
const state = { seed: '', ...DEFAULTS };

const options = (extra) => optionsFor(state, extra, HOLIDAY_PALETTES);
const snippet = () => snippetFor(state);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

const ACCESSORY_NAMES = { headphones: 'headphones', visor: 'a visor band', bow: 'a bow', cap: 'a cap' };

/** Names the big robot for screen readers, so a change of seed or option is heard. */
function describe() {
  const t = resolveTraits(state.seed, options());
  const palette = HOLIDAY_PALETTES[state.palette] ?? PALETTES[t.palette];
  const framing = state.frame === 'square' ? [] : [`in a ${state.frame} frame`];
  const parts = [`${t.shape} cells`, ...framing, `${palette.name} palette`, `${t.head} head`, `${t.eyes} eyes`];
  if (t.mouth !== 'none') parts.push(`${t.mouth === 'o' ? 'O-shaped' : t.mouth} mouth`);
  // Matches slots() in the package: these accessories and an off-side antenna take the top piece's place.
  const isTopCovered = ['headphones', 'bow', 'cap'].includes(t.accessory) || t.quirk === 'antenna';
  if (t.top !== 'none' && !isTopCovered) parts.push(`${t.top} on top`);
  if (t.accessory !== 'none') parts.push(`wearing ${ACCESSORY_NAMES[t.accessory]}`);
  return `Robot for "${state.seed}": ${parts.join(', ')}`;
}

// Safari throttles history calls (about 100 per 30s), so typing updates the hash in a debounce.
let hashTimer;
function saveHash() {
  clearTimeout(hashTimer);
  hashTimer = setTimeout(() => {
    const hash = new URLSearchParams();
    hash.set('seed', state.seed);
    for (const k of KEYS) if (state[k] !== DEFAULTS[k]) hash.set(k, state[k]);
    try {
      history.replaceState(null, '', `#${hash}`);
    } catch {
      /* throttled or blocked: the robot still draws, only the link lags */
    }
  }, 300);
}

/**
 * The robot at a size. An animated robot goes in an <img>: the CSP's style-src 'self'
 * would block the <style> inside an inlined SVG, but an image is its own document.
 */
function robot(size) {
  const opts = options({ size, title: null });
  if (!opts.animate) return botling(state.seed, opts);
  return `<img src="${botlingDataUri(state.seed, opts)}" alt="" width="${size}" height="${size}">`;
}

function draw() {
  $('big').innerHTML = robot(240);
  $('big').setAttribute('aria-label', describe());
  $('sizes').innerHTML = [96, 48, 32, 24].map((size) => `<li>${robot(size)}<span>${size}px</span></li>`).join('');
  $('code').textContent = snippet();
  for (const input of document.querySelectorAll('.choices input')) input.checked = state[input.name] === input.value;
  $('grid').setAttribute('aria-pressed', String(state.grid !== 'off'));
  $('animate').setAttribute('aria-pressed', String(state.motion === 'on'));
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

function swatch(p) {
  return `<i class="sw" aria-hidden="true"><b data-c="${p.bg}"></b><b data-c="${p.body}"></b><b data-c="${p.glow}"></b><b data-c="${p.accent}"></b></i>`;
}

const title = (s) => s[0].toUpperCase() + s.slice(1);
radios($('shapes'), 'shape', [['auto', 'Seed picks'], ...SHAPES.map((s) => [s, title(s)])]);
radios(
  $('frames'),
  'frame',
  FRAMES.map((f) => [f, title(f)]),
);
radios($('palettes'), 'palette', [['auto', 'Seed picks'], ...PALETTES.map((p, i) => [String(i), p.name, swatch(p)])]);
// Same radio name as the palettes above, so picking a holiday clears an everyday palette.
radios(
  $('holidays'),
  'palette',
  Object.entries(HOLIDAY_PALETTES).map(([key, p]) => [key, p.name, swatch(p)]),
);
radios($('grids'), 'grid', [
  ['auto', 'Auto'],
  ['on', 'On'],
  ['off', 'Off'],
]);
radios($('motions'), 'motion', [
  ['off', 'Still'],
  ['on', 'Animated'],
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
  const seeds = Array.from({ length: 28 }, () => randomSeed());
  $('gallery').innerHTML = seeds
    .map(
      (s) =>
        `<li><button type="button" data-seed="${s}" aria-label="Try ${s}"><img src="${botlingDataUri(s, { size: 64, title: null })}" alt="" width="64" height="64"></button></li>`,
    )
    .join('');
}

$('seed').addEventListener('input', (e) => {
  state.seed = e.target.value;
  draw();
});
$('seed-form').addEventListener('submit', (e) => e.preventDefault());
// A new seed, cells and palette (everyday or holiday). Grid and motion stay as they are.
const pickOne = (list) => list[Math.floor(Math.random() * list.length)];
$('random').addEventListener('click', () => {
  state.seed = $('seed').value = randomSeed();
  state.shape = pickOne(SHAPES);
  state.palette = pickOne([...PALETTES.map((_, i) => String(i)), ...Object.keys(HOLIDAY_PALETTES)]);
  draw();
});
// Shortcuts to the Background grid and Motion options, up where people land. The grid
// button turns the grid off, or back to auto, which draws it on the big robot.
$('grid').addEventListener('click', () => {
  state.grid = state.grid === 'off' ? 'auto' : 'off';
  draw();
});
$('animate').addEventListener('click', () => {
  state.motion = state.motion === 'on' ? 'off' : 'on';
  draw();
});
$('shuffle').addEventListener('click', gallery);
$('gallery').addEventListener('click', (e) => {
  const button = e.target.closest('button[data-seed]');
  if (!button) return;
  state.seed = $('seed').value = button.dataset.seed;
  draw();
  // Move focus with the view, so keyboard and screen-reader users land on the new robot too.
  $('seed').focus({ preventScroll: true });
  $('seed').scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'center' });
  say(`Showing ${button.dataset.seed}`);
});
$('copy-code').addEventListener('click', () => copy(snippet(), 'Code'));
$('copy-svg').addEventListener('click', () => copy(botling(state.seed, options()), 'SVG'));
function save(blob, name) {
  const url = URL.createObjectURL(blob);
  Object.assign(document.createElement('a'), { href: url, download: name }).click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
/**
 * The image as a file. PNG and JPG are the still robot at 512px; a 256px GIF moves if
 * Motion is on. Their code loads on first use, so the page doesn't carry a GIF encoder
 * for everyone.
 */
async function image(format) {
  if (format === 'svg') return new Blob([botling(state.seed, options())], { type: 'image/svg+xml' });
  // Drawn before the import, so the file is the robot on screen when the button was pressed.
  const size = format === 'gif' ? 256 : 512;
  const svg = botling(state.seed, { ...options({ size, title: null }), ...(format !== 'gif' && { animate: false }) });
  const { gif, still } = await import('/export.js');
  return format === 'gif' ? gif(svg, size) : still(svg, size, format);
}
let busy = false;
$('downloads').addEventListener('click', async (e) => {
  const format = e.target.closest('button[data-format]')?.dataset.format;
  if (!format || busy) return;
  const label =
    format === 'gif' && state.motion === 'on' ? 'Animated GIF' : format === 'jpeg' ? 'JPG' : format.toUpperCase();
  // Named now: the seed can change while a GIF is being made.
  const name = `botling-${state.seed.slice(0, 40) || 'robot'}.${format === 'jpeg' ? 'jpg' : format}`;
  busy = true;
  $('downloads').setAttribute('aria-busy', 'true');
  if (format !== 'svg') say(`Making the ${label}…`);
  try {
    save(await image(format), name);
    say(`${label} downloaded`);
    track('downloaded');
  } catch {
    say(`Couldn't make the ${label}; try the SVG instead`);
  } finally {
    busy = false;
    $('downloads').removeAttribute('aria-busy');
  }
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

/** Loads the state from the URL hash: on load, and when a shared link is opened in this tab. */
function readHash() {
  const fromHash = new URLSearchParams(location.hash.slice(1));
  // A text input can't hold a line break, so drop them rather than draw a robot the box can't show.
  state.seed = fromHash.get('seed')?.replace(/[\r\n]+/g, '') ?? randomSeed();
  for (const k of KEYS) {
    const v = fromHash.get(k);
    state[k] = v && document.querySelector(`.choices input[name="${k}"][value="${CSS.escape(v)}"]`) ? v : DEFAULTS[k];
  }
  $('seed').value = state.seed;
  draw();
}
// replaceState doesn't fire hashchange, so this only runs for real navigations.
window.addEventListener('hashchange', readHash);
readHash();
gallery();
track('pageview', arrival(document.referrer, location.hostname));
