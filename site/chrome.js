// What every page shares: the theme toggle, the phone menu, code blocks and the page-view count.
import { arrival, track } from '/track.js';
import '/code.js';

document.querySelector('.theme').addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem('seedkin-theme', next);
  } catch {
    /* storage blocked: the choice lasts for this page only */
  }
});

// The current page in the nav, for screen readers and the underline: the longest link the
// path starts with, so /styles/botling/ marks Playground rather than Styles.
const here = [...document.querySelectorAll('.top nav a[href^="/"]')]
  .filter((a) => location.pathname.startsWith(a.getAttribute('href')))
  .sort((a, b) => b.getAttribute('href').length - a.getAttribute('href').length)[0];
here?.setAttribute('aria-current', 'page');

// On a phone the nav folds behind a Menu button. Escape closes it and returns focus.
const menu = document.querySelector('.menu-btn');
const nav = document.getElementById('site-nav');
const setMenu = (open) => {
  menu.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
};
menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
nav.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menu.focus();
  }
});

track('pageview', arrival(document.referrer, location.hostname));
