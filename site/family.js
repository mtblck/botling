// The family pages: the landing page's seed box, which grows one seed in every style, and
// the style strips on /styles/. Packaged styles come from the package build (/lib); the
// lab ones from lab/preview.ts, bundled to /preview.js. Seeds stay in the URL hash.

import { beastie, beastieDataUri } from '/lib/styles/beastie/index.js';
import { botling, botlingDataUri, randomSeed } from '/lib/styles/botling/index.js';
import { noggin, nogginDataUri } from '/lib/styles/noggin/index.js';
import { snoot, snootDataUri } from '/lib/styles/snoot/index.js';
import { PREVIEWS } from '/preview.js';

// The landing page's Animate button. An animated avatar goes in an <img>, because the CSP's
// style-src 'self' would block the <style> inside an inlined SVG. It holds still for anyone
// who asks for reduced motion.
let animate = false;
/** Draws a style still, inline, or animated, as an image. */
const drawer = (draw, dataUri) => (seed, size, frame) =>
  animate
    ? `<img src="${dataUri(seed, { size, frame, animate: true, title: null })}" alt="" width="${size}" height="${size}">`
    : draw(seed, { size, frame, title: null });
const DRAW = {
  botling: drawer(botling, botlingDataUri),
  snoot: drawer(snoot, snootDataUri),
  noggin: drawer(noggin, nogginDataUri),
  beastie: drawer(beastie, beastieDataUri),
  // Lab styles animate inline: their SVG moves with SMIL, which the CSP allows.
  ...Object.fromEntries(
    PREVIEWS.map((p) => [p.name.toLowerCase(), (seed, size, frame) => p.render(seed, size, frame, animate)]),
  ),
};
const $ = (id) => document.getElementById(id);

/**
 * Draws [data-avatar] elements: those with a data-seed of their own (drawn once, on load),
 * or by default those without, with this seed. An element can also set its size and frame
 * with data-size and data-frame.
 */
function grow(seed, selector = '[data-avatar]:not([data-seed])') {
  for (const el of document.querySelectorAll(selector)) {
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

grow('', '[data-avatar][data-seed]');
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
  $('animate')?.addEventListener('click', (e) => {
    animate = !animate;
    e.currentTarget.setAttribute('aria-pressed', String(animate));
    grow(input.value);
  });
  window.addEventListener('hashchange', readHash);
  readHash();
}

for (const strip of document.querySelectorAll('[data-strip]')) {
  const draw = DRAW[strip.dataset.strip];
  strip.innerHTML = Array.from({ length: 8 }, () => `<li>${draw(randomSeed(), 64)}</li>`).join('');
}
