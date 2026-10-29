/*
 * Vercel Web Analytics: cookieless page views, for Vercel's own dashboard.
 * Vercel serves /_vercel/insights/ only on its own deployments, so the script
 * is left out on localhost, where it would 404. A file rather than an inline
 * script, because the CSP is script-src 'self'.
 */
(() => {
  if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) return;
  // The insights script reports the full URL, hash and all. Seeds live in the hash, so cut
  // it off before anything is sent. This is the queue @vercel/analytics' inject() uses.
  window.vaq = window.vaq || [];
  window.va = window.va || ((...args) => window.vaq.push(args));
  window.va('beforeSend', (event) => ({ ...event, url: event.url.split('#')[0] }));
  var s = document.createElement('script');
  s.defer = true;
  s.src = '/_vercel/insights/script.js';
  document.head.appendChild(s);
})();
