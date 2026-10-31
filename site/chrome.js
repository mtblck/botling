// What every page shares: the theme toggle and the page-view count.
import { arrival, track } from '/track.js';

document.querySelector('.theme').addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem('seedkin-theme', next);
  } catch {
    /* storage blocked: the choice lasts for this page only */
  }
});

// The current page in the nav, for screen readers and the underline.
for (const a of document.querySelectorAll('.top nav a')) {
  if (a.getAttribute('href') !== '/' && location.pathname.startsWith(a.getAttribute('href'))) {
    a.setAttribute('aria-current', 'page');
  }
}

track('pageview', arrival(document.referrer, location.hostname));
