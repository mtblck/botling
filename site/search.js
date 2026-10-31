// The site search: a dialog over every page and heading, opened from the header or with "/".
// The index (/search.json, built by scripts/search.mjs) loads on first open; nothing leaves
// the browser but that one same-origin request.
import { find } from '/find.js';

const btn = document.querySelector('.search-btn');
const dialog = document.createElement('dialog');
dialog.className = 'search';
dialog.setAttribute('aria-label', 'Search the site');
dialog.innerHTML = `<form method="dialog" class="search-form" role="search">
  <label class="sr-only" for="search-q">Search the site</label>
  <input id="search-q" type="search" autocomplete="off" spellcheck="false" placeholder="Search docs and pages…" aria-controls="search-results" aria-describedby="search-count" />
  <button type="submit" class="search-close" aria-label="Esc, close search">Esc</button>
</form>
<p id="search-count" class="sr-only" role="status"></p>
<ul id="search-results" class="search-results"></ul>`;
document.body.append(dialog);
const input = dialog.querySelector('input');
const list = dialog.querySelector('ul');
const count = dialog.querySelector('#search-count');

let index;
async function load() {
  index ??= fetch('/search.json').then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))));
  try {
    return await index;
  } catch {
    index = undefined; // try again next time
    return null;
  }
}

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
async function show() {
  const q = input.value;
  const entries = await load();
  if (q !== input.value) return; // a newer keystroke is on its way
  if (!entries) {
    list.innerHTML = '';
    count.textContent = "Search couldn't load; try again";
    return;
  }
  const hits = find(entries, q);
  list.innerHTML = hits
    .map(
      (h) =>
        `<li><a href="${esc(h.url)}"><span class="search-title">${esc(h.title)}</span>${h.page !== h.title ? `<span class="search-page">${esc(h.page)}</span>` : ''}</a></li>`,
    )
    .join('');
  count.textContent = q.trim() ? `${hits.length || 'No'} result${hits.length === 1 ? '' : 's'}` : '';
}

function open() {
  if (dialog.open) return;
  dialog.showModal();
  input.select();
  load();
}
btn.addEventListener('click', open);
input.addEventListener('input', show);
document.addEventListener('keydown', (e) => {
  const typing = e.target.closest?.('input, textarea, select, [contenteditable]');
  if (
    (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) ||
    (e.key === 'k' && (e.metaKey || e.ctrlKey))
  ) {
    e.preventDefault();
    open();
  }
});
// Arrow keys move between the box and the results; Enter in the box opens the first one.
dialog.addEventListener('keydown', (e) => {
  const links = [...list.querySelectorAll('a')];
  const at = links.indexOf(document.activeElement);
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    const next = e.key === 'ArrowDown' ? at + 1 : at - 1;
    (next < 0 ? input : links[Math.min(next, links.length - 1)])?.focus();
  } else if (e.key === 'Enter' && e.target === input && links[0]) {
    e.preventDefault();
    links[0].click();
  }
});
// A click on the backdrop closes it; so does following a link to a heading on this page.
dialog.addEventListener('click', (e) => {
  if (e.target === dialog) dialog.close();
  if (e.target.closest('a')) dialog.close();
});
dialog.addEventListener('close', () => btn.focus());
