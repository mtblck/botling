// The playground every style page shares: the avatar, its sizes, code and downloads in one
// column, and the options beside it. A style page passes its functions and option groups
// (site/botling.js, site/snoot.js). State lives in the URL hash, which never reaches the
// server or analytics: seeds stay in the browser.
import { highlight } from '/highlight.js';
import { options as optionsFor, snippet as snippetFor } from '/snippet.js';
import { track } from '/track.js';

const $ = (id) => document.getElementById(id);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const pickOne = (list) => list[Math.floor(Math.random() * list.length)];

const title = (s) => s[0].toUpperCase() + s.slice(1).replaceAll('-', ' ');

/**
 * The option groups every style has: cells, look, frame and background grid.
 *
 * @param {{ SHAPES: readonly string[], FRAMES: readonly string[], LOOKS: readonly string[] }} style - The style's exports
 * @returns {{ cells: object, look: object, frame: object, grid: object }} Groups for playground()
 */
export function sharedGroups({ SHAPES, FRAMES, LOOKS }) {
  return {
    cells: { name: 'shape', legend: 'Cells', choices: [['auto', 'Seed picks'], ...SHAPES.map((s) => [s, title(s)])] },
    look: { name: 'look', legend: 'Look', choices: LOOKS.map((l) => [l, title(l)]) },
    frame: { name: 'frame', legend: 'Frame', choices: FRAMES.map((f) => [f, title(f)]) },
    grid: {
      name: 'grid',
      legend: 'Background grid',
      choices: [
        ['auto', 'Auto'],
        ['on', 'On'],
        ['off', 'Off'],
      ],
    },
    motion: {
      name: 'motion',
      legend: 'Motion',
      choices: [
        ['off', 'Still'],
        ['on', 'Animated'],
      ],
    },
  };
}

/**
 * Starts the playground.
 *
 * @param {object} style - The style's name (its function's name), noun ('robot'), draw and
 *   dataUri functions, randomSeed, holidays (HOLIDAY_PALETTES or {}), describe(seed, options)
 *   for screen readers, swatch(palette) giving its four colours, and groups: option groups
 *   as { name, legend, choices: [[value, label, swatch?]] }, the first choice the default; a
 *   swatch is a palette or an array of colours. A style's own groups start with 'auto', which
 *   snippet.js leaves out of the code.
 *   Two groups may share a name (everyday and holiday palettes): picking in one clears the other.
 */
export function playground(style) {
  const { name, noun, draw: drawStyle, dataUri, randomSeed, holidays = {}, groups } = style;
  const DEFAULTS = {};
  for (const g of groups) DEFAULTS[g.name] ??= g.choices[0][0];
  const KEYS = Object.keys(DEFAULTS);
  const state = { seed: '', ...DEFAULTS };
  const options = (extra) => optionsFor(state, extra, holidays);
  const snippet = () => snippetFor(state, name);

  // Safari throttles history calls (about 100 per 30s), so typing updates the hash in a debounce.
  let hashTimer;
  function saveHash() {
    clearTimeout(hashTimer);
    hashTimer = setTimeout(() => {
      const hash = new URLSearchParams({ seed: state.seed });
      for (const k of KEYS) if (state[k] !== DEFAULTS[k]) hash.set(k, state[k]);
      try {
        history.replaceState(null, '', `#${hash}`);
      } catch {
        /* throttled or blocked: the avatar still draws, only the link lags */
      }
    }, 300);
  }

  /**
   * The avatar at a size. An animated one goes in an <img>: the CSP's style-src 'self'
   * would block the <style> inside an inlined SVG, but an image is its own document.
   */
  function avatar(size) {
    const opts = options({ size, title: null });
    if (!opts.animate) return drawStyle(state.seed, opts);
    return `<img src="${dataUri(state.seed, opts)}" alt="" width="${size}" height="${size}">`;
  }

  function draw() {
    $('big').innerHTML = avatar(240);
    $('big').setAttribute('aria-label', style.describe(state.seed, options()));
    $('sizes').innerHTML = [96, 48, 32, 24].map((size) => `<li>${avatar(size)}<span>${size}px</span></li>`).join('');
    $('code').innerHTML = highlight(snippet(), 'js');
    for (const input of document.querySelectorAll('.choices input')) input.checked = state[input.name] === input.value;
    for (const link of document.querySelectorAll('[data-to]')) {
      link.href = `/styles/${link.dataset.to}/#${new URLSearchParams({ seed: state.seed })}`;
    }
    saveHash();
  }

  // The option groups, as radio buttons styled as segments or swatches.
  // A choice's swatch: a palette (through style.swatch) or a list of colours, such as a skin tone.
  const swatch = (p) =>
    `<i class="sw" aria-hidden="true">${(Array.isArray(p) ? p : style.swatch(p)).map((c) => `<b data-c="${c}"></b>`).join('')}</i>`;
  $('options').insertAdjacentHTML(
    'beforeend',
    groups
      .map((g, i) => {
        const kind = g.choices.some(([, , p]) => p) ? 'swatches' : 'segments';
        const choices = g.choices
          .map(([value, label, p]) => {
            const id = `opt-${i}-${value}`;
            return `<input type="radio" name="${g.name}" id="${id}" value="${value}"><label for="${id}">${p ? swatch(p) : ''}<span>${label}</span></label>`;
          })
          .join('');
        return `<fieldset class="group"><legend>${g.legend}</legend><div class="choices ${kind}">${choices}</div></fieldset>`;
      })
      .join(''),
  );
  // Swatch colours go in through the CSSOM, which the CSP allows, rather than style attributes.
  for (const b of document.querySelectorAll('.sw b')) b.style.background = b.dataset.c;
  $('options').addEventListener('change', (e) => {
    state[e.target.name] = e.target.value;
    draw();
    gallery();
  });
  $('reset').addEventListener('click', () => {
    Object.assign(state, DEFAULTS);
    draw();
    gallery();
    say('Options reset to what the seed picks');
  });

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

  // More seeds, drawn with the options on screen, so a change shows on many avatars at once.
  // Redrawn when an option changes, not on every keystroke in the seed box.
  let seeds = [];
  const shuffle = () => (seeds = Array.from({ length: 24 }, () => randomSeed()));
  function gallery() {
    $('gallery').innerHTML = seeds
      .map(
        (s) =>
          `<li><button type="button" data-seed="${s}" aria-label="Try ${s}"><img src="${dataUri(s, options({ size: 64, title: null }))}" alt="" width="64" height="64"></button></li>`,
      )
      .join('');
  }

  $('seed').addEventListener('input', (e) => {
    state.seed = e.target.value;
    draw();
  });
  $('seed-form').addEventListener('submit', (e) => e.preventDefault());
  // A new seed, cells and palette (everyday or holiday). Look, frame, grid and motion stay as they are.
  $('random').addEventListener('click', () => {
    state.seed = $('seed').value = randomSeed();
    for (const key of ['shape', 'palette']) {
      const values = groups.filter((g) => g.name === key).flatMap((g) => g.choices.map(([v]) => v));
      const picks = values.filter((v) => v !== 'auto');
      if (picks.length) state[key] = pickOne(picks);
    }
    draw();
    gallery();
  });
  $('shuffle').addEventListener('click', () => {
    shuffle();
    gallery();
    say('New seeds, with the same options');
  });
  $('gallery').addEventListener('click', (e) => {
    const button = e.target.closest('button[data-seed]');
    if (!button) return;
    state.seed = $('seed').value = button.dataset.seed;
    draw();
    // Move focus with the view, so keyboard and screen-reader users land on the new avatar too.
    $('seed').focus({ preventScroll: true });
    $('seed').scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'center' });
    say(`Showing ${button.dataset.seed}`);
  });
  $('copy-code').addEventListener('click', () => copy(snippet(), 'Code'));
  $('copy-svg').addEventListener('click', () => copy(drawStyle(state.seed, options()), 'SVG'));

  function save(blob, file) {
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement('a'), { href: url, download: file }).click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  /**
   * The image as a file. PNG and JPG are the still avatar at 512px; a 256px GIF moves if
   * Motion is on. Their code loads on first use, so the page doesn't carry a GIF encoder
   * for everyone.
   */
  async function image(format) {
    if (format === 'svg') return new Blob([drawStyle(state.seed, options())], { type: 'image/svg+xml' });
    // Drawn before the import, so the file is the avatar on screen when the button was pressed.
    const size = format === 'gif' ? 256 : 512;
    const svg = drawStyle(state.seed, {
      ...options({ size, title: null }),
      ...(format !== 'gif' && { animate: false }),
    });
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
    const file = `${name}-${state.seed.slice(0, 40) || noun}.${format === 'jpeg' ? 'jpg' : format}`;
    busy = true;
    $('downloads').setAttribute('aria-busy', 'true');
    if (format !== 'svg') say(`Making the ${label}…`);
    try {
      save(await image(format), file);
      say(`${label} downloaded`);
      track('downloaded');
    } catch {
      say(`Couldn't make the ${label}; try the SVG instead`);
    } finally {
      busy = false;
      $('downloads').removeAttribute('aria-busy');
    }
  });

  /** Loads the state from the URL hash: on load, and when a shared link is opened in this tab. */
  function readHash() {
    const fromHash = new URLSearchParams(location.hash.slice(1));
    // A text input can't hold a line break, so drop them rather than draw an avatar the box can't show.
    state.seed = fromHash.get('seed')?.replace(/[\r\n]+/g, '') ?? randomSeed();
    for (const k of KEYS) {
      const v = fromHash.get(k);
      state[k] = v && document.querySelector(`.choices input[name="${k}"][value="${CSS.escape(v)}"]`) ? v : DEFAULTS[k];
    }
    $('seed').value = state.seed;
    draw();
    gallery();
  }
  // replaceState doesn't fire hashchange, so this only runs for real navigations.
  window.addEventListener('hashchange', readHash);
  shuffle();
  readHash();
}
