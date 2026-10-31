// Sets the page theme before first paint (a file, not inline: the CSP is script-src 'self'),
// and marks the page as scripted so the phone menu can start closed.
(() => {
  var t = null;
  try {
    t = localStorage.getItem('seedkin-theme');
  } catch {
    /* storage blocked */
  }
  if (t !== 'light' && t !== 'dark') t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.dataset.theme = t;
  document.documentElement.classList.add('js');
})();
