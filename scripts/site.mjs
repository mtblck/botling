// npm run site: builds the playground into dist-site/ with Node only (Vercel runs this).
// The page and its assets come from site/; botling itself is copied in from the package
// build (dist/), so the playground always runs exactly what npm ships.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const out = path.join(ROOT, 'dist-site');
const dist = path.join(ROOT, 'dist');
if (!fs.existsSync(path.join(dist, 'index.js'))) throw new Error('Run npm run build first: dist/index.js is missing');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'fonts'), { recursive: true });

const { botling } = await import(path.join(dist, 'index.js'));
// The mark and favicon are a botling: this seed, square cells, Indigo palette.
const LOGO_SEED = 'botling';
const logo = botling(LOGO_SEED, { size: 32, palette: 1, shape: 'square', title: null });
const icon = botling(LOGO_SEED, { size: 64, palette: 1, shape: 'square', detail: 'small', title: null });

const page = fs.readFileSync(path.join(ROOT, 'site/index.html'), 'utf8').replace('{{logo}}', logo);
fs.writeFileSync(path.join(out, 'index.html'), page);
fs.writeFileSync(path.join(out, 'icon.svg'), icon);
for (const f of ['site.css', 'site.js', 'words.js', 'theme.js', 'analytics.js']) {
  fs.copyFileSync(path.join(ROOT, 'site', f), path.join(out, f));
}
fs.cpSync(dist, path.join(out, 'lib'), { recursive: true, filter: (f) => !f.endsWith('.d.ts') && !f.endsWith('.map') });

// Fonts, self-hosted: the CSP allows font-src 'self' only.
const req = createRequire(import.meta.url);
const font = (pkg, file, as) =>
  fs.copyFileSync(
    path.join(path.dirname(req.resolve(`${pkg}/package.json`)), 'files', file),
    path.join(out, 'fonts', as),
  );
font('@fontsource-variable/pixelify-sans', 'pixelify-sans-latin-wght-normal.woff2', 'pixelify.woff2');
font('@fontsource-variable/jetbrains-mono', 'jetbrains-mono-latin-wght-normal.woff2', 'jetbrains-mono.woff2');

console.log(`built ${path.relative(ROOT, out)}/`);
