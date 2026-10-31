// The docs pages: the sidebar folds into a menu on phones, and links to the old one-page
// docs (/docs/#frames) land on the section's new page.
const OLD = {
  'random-robots': 'botling',
  options: 'botling',
  frames: 'botling',
  animation: 'botling',
  'holiday-palettes': 'botling',
  'building-a-picker': 'botling',
  advanced: 'botling',
  'how-it-works': 'how-it-works',
  versioning: 'versioning',
  snoot: 'snoot',
  noggin: 'noggin',
  beastie: 'beastie',
  sprite: 'sprite',
};
const old = location.pathname === '/docs/' && OLD[location.hash.slice(1)];
if (old) {
  // Sections that became pages lose their anchor; the rest keep it on the new page.
  location.replace(`/docs/${old}/${old === location.hash.slice(1) ? '' : location.hash}`);
}

const btn = document.querySelector('.docs-nav-btn');
const list = document.getElementById('docs-nav-list');
btn?.addEventListener('click', () => {
  const open = btn.getAttribute('aria-expanded') !== 'true';
  btn.setAttribute('aria-expanded', String(open));
  list.classList.toggle('is-open', open);
});
