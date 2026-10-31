// npm run site: builds seedkin.dev into dist-site/ (Vercel runs this). Every index.html
// under site/ is a page, filled in from site/partials/. The package build (dist/) is copied
// to /lib, so the playground always runs exactly what npm ships; the preview styles from
// lab/ are bundled to /preview.js, since they aren't in the package yet.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSync } from 'esbuild';
import { ogImage } from './og.mjs';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const out = path.join(ROOT, 'dist-site');
const dist = path.join(ROOT, 'dist');
if (!fs.existsSync(path.join(dist, 'index.js'))) throw new Error('Run npm run build first: dist/index.js is missing');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'fonts'), { recursive: true });

const lib = await import(path.join(dist, 'styles/botling/index.js'));
const { botling, PALETTES } = lib;
// The mark and favicon are a botling: this seed, square cells, Ice palette.
const LOGO_SEED = 'jolly-sprocket-65';
const LOGO = { shape: 'square', palette: PALETTES.findIndex((p) => p.name === 'Ice'), title: null };
const logo = botling(LOGO_SEED, { ...LOGO, size: 32 });
const icon = botling(LOGO_SEED, { ...LOGO, size: 64, detail: 'small' });

// Preload every module of the package, so the browser fetches them together rather than
// finding each import only after the one before it has loaded.
const preloads = fs
  .readdirSync(dist, { recursive: true })
  .filter((f) => f.endsWith('.js'))
  .sort()
  .map((f) => `<link rel="modulepreload" href="/lib/${f.split(path.sep).join('/')}" />`)
  .join('\n  ');
const partials = Object.fromEntries(
  ['head', 'header', 'footer'].map((name) => [
    name,
    fs.readFileSync(path.join(ROOT, `site/partials/${name}.html`), 'utf8').trim(),
  ]),
);
const site = path.join(ROOT, 'site');
const pages = fs
  .readdirSync(site, { recursive: true })
  .filter((f) => path.basename(f) === 'index.html')
  .sort();
for (const file of pages) {
  const page = fs
    .readFileSync(path.join(site, file), 'utf8')
    .replace(/{{(head|header|footer)}}/g, (_, name) => partials[name])
    .replaceAll('{{logo}}', logo)
    .replaceAll('{{preloads}}', preloads);
  if (page.includes('{{')) throw new Error(`site/${file} has a placeholder the build doesn't fill`);
  fs.mkdirSync(path.dirname(path.join(out, file)), { recursive: true });
  fs.writeFileSync(path.join(out, file), page);
}
fs.writeFileSync(path.join(out, 'icon.svg'), icon);
fs.writeFileSync(path.join(out, 'og.png'), ogImage(lib));
for (const f of fs.readdirSync(site).filter((f) => /\.(js|css)$/.test(f))) {
  fs.copyFileSync(path.join(site, f), path.join(out, f));
}
buildSync({
  entryPoints: [path.join(ROOT, 'lab/preview.ts')],
  outfile: path.join(out, 'preview.js'),
  bundle: true,
  format: 'esm',
  minify: true,
  target: 'es2020',
  legalComments: 'none',
});
fs.cpSync(dist, path.join(out, 'lib'), { recursive: true, filter: (f) => !f.endsWith('.d.ts') && !f.endsWith('.map') });

// Fonts, self-hosted: the CSP allows font-src 'self' only.
const req = createRequire(import.meta.url);
const font = (pkg, file, as) =>
  fs.copyFileSync(
    path.join(path.dirname(req.resolve(`${pkg}/package.json`)), 'files', file),
    path.join(out, 'fonts', as),
  );
font('@fontsource-variable/pixelify-sans', 'pixelify-sans-latin-wght-normal.woff2', 'pixelify.woff2');

console.log(`built ${path.relative(ROOT, out)}/`);
