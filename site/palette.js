// A switcher for comparing light-theme palettes (site/palettes.css), shown on previews and
// localhost but not on seedkin.dev. ?palette=<name> picks one for a shareable link.
const PALETTES = ['lavender', 'paper', 'snow', 'mint', 'sunbeam'];
const KEY = 'seedkin-palette';
const root = document.documentElement;

const fromQuery = new URLSearchParams(location.search).get('palette');
let saved = null;
try {
  saved = localStorage.getItem(KEY);
} catch {
  /* storage blocked */
}
const live = /(^|\.)seedkin\.dev$/.test(location.hostname);
// A ?palette= link is for looking at a light palette, so it opens in the light theme.
if (!live && fromQuery) root.dataset.theme = 'light';
const pick = live ? 'lavender' : [fromQuery, saved].find((p) => PALETTES.includes(p)) || 'lavender';
root.dataset.palette = pick;

if (!live) {
  const label = document.createElement('label');
  label.className = 'palette-pick';
  label.textContent = 'Light palette ';
  const select = document.createElement('select');
  for (const p of PALETTES) select.add(new Option(p[0].toUpperCase() + p.slice(1), p, false, p === pick));
  select.addEventListener('change', () => {
    // The palettes are light-only, so picking one shows the light theme.
    root.dataset.palette = select.value;
    root.dataset.theme = 'light';
    try {
      localStorage.setItem(KEY, select.value);
      localStorage.setItem('seedkin-theme', 'light');
    } catch {
      /* storage blocked: the choice lasts for this page only */
    }
  });
  label.append(select);
  addEventListener('DOMContentLoaded', () => document.body.append(label));
}
