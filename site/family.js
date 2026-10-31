// The family pages: the landing page's seed box, which grows one seed in every style, and
// the style strips on /styles/. Packaged styles come from the package build (/lib); the
// lab ones from lab/preview.ts, bundled to /preview.js. Seeds stay in the URL hash.
import { botling, randomSeed } from '/lib/styles/botling/index.js';
import { snoot } from '/lib/styles/snoot/index.js';
import { PREVIEWS } from '/preview.js';

const DRAW = {
  botling: (seed, size, frame) => botling(seed, { size, frame, title: null }),
  snoot: (seed, size, frame) => snoot(seed, { size, frame, title: null }),
  ...Object.fromEntries(PREVIEWS.map((p) => [p.name.toLowerCase(), p.render])),
};
const $ = (id) => document.getElementById(id);

/**
 * Draws every [data-avatar] that has no seed of its own with this one. An element can set
 * its own seed, size and frame with data-seed, data-size and data-frame.
 */
function grow(seed) {
  for (const el of document.querySelectorAll('[data-avatar]')) {
    const { avatar, frame } = el.dataset;
    const size = Number(el.dataset.size) || (el.dataset.seed ? 96 : 128);
    el.innerHTML = DRAW[avatar](el.dataset.seed ?? seed, size, frame);
    // Decorative: the style's name is next to it.
    el.firstElementChild?.setAttribute('aria-hidden', 'true');
  }
  for (const link of document.querySelectorAll('[data-to]')) {
    link.href = `/styles/${link.dataset.to}/#${new URLSearchParams({ seed })}`;
  }
}

// Safari throttles history calls, so typing updates the hash in a debounce.
let hashTimer;
function saveHash(seed) {
  clearTimeout(hashTimer);
  hashTimer = setTimeout(() => {
    try {
      history.replaceState(null, '', `#${new URLSearchParams({ seed })}`);
    } catch {
      /* throttled or blocked: only the link lags */
    }
  }, 300);
}

const input = $('seed');
if (input) {
  const readHash = () => {
    input.value = new URLSearchParams(location.hash.slice(1)).get('seed')?.replace(/[\r\n]+/g, '') ?? randomSeed();
    grow(input.value);
  };
  input.addEventListener('input', () => {
    grow(input.value);
    saveHash(input.value);
  });
  $('seed-form').addEventListener('submit', (e) => e.preventDefault());
  $('random').addEventListener('click', () => {
    input.value = randomSeed();
    grow(input.value);
    saveHash(input.value);
  });
  window.addEventListener('hashchange', readHash);
  readHash();
} else {
  grow('');
}

for (const strip of document.querySelectorAll('[data-strip]')) {
  const draw = DRAW[strip.dataset.strip];
  strip.innerHTML = Array.from({ length: 8 }, () => `<li>${draw(randomSeed(), 64)}</li>`).join('');
}
