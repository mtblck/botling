// npm run hosting:check: fails if vercel.json's security headers or CSP regress, or if the
// site sources pick up an inline script or handler the CSP would block.
import fs from 'node:fs';
import path from 'node:path';

// The repo root to check; a test passes a fixture directory here.
const root = path.resolve(process.argv[2] ?? '.');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const fail = (msg) => {
  console.error(`hosting:check: ${msg}`);
  process.exitCode = 1;
};
const config = JSON.parse(read('vercel.json'));
const all = config.headers?.find((h) => h.source === '/(.*)')?.headers ?? [];
const header = (key) => all.find((h) => h.key === key)?.value;
const csp = header('Content-Security-Policy') ?? '';
const directive = (name) =>
  csp
    .split(';')
    .map((d) => d.trim())
    .find((d) => d.startsWith(`${name} `));

if (directive('script-src') !== "script-src 'self'")
  fail(`script-src must be exactly 'self', got: ${directive('script-src')}`);
if (/unsafe-(inline|eval)/.test(csp)) fail('the CSP must not allow unsafe-inline or unsafe-eval');
if (!directive('frame-ancestors')?.includes("'none'")) fail("frame-ancestors must be 'none'");
if (!directive('object-src')?.includes("'none'")) fail("object-src must be 'none'");
for (const key of ['X-Content-Type-Options', 'Referrer-Policy', 'Strict-Transport-Security', 'Permissions-Policy']) {
  if (!header(key)) fail(`missing ${key}`);
}
for (const key of ['cleanUrls', 'trailingSlash', 'routes']) if (key in config) fail(`vercel.json must not set ${key}`);

const html = read('site/index.html');
for (const tag of html.match(/<script\b[^>]*>/g) ?? [])
  if (!/\bsrc=/.test(tag)) fail(`inline script in site/index.html: ${tag}`);
if (/\son[a-z]+\s*=/i.test(html)) fail('inline event handler in site/index.html');
if (/\sstyle\s*=/i.test(html)) fail("style attribute in site/index.html (style-src is 'self')");

// Markup the scripts build with innerHTML is held to the same rule as the page.
for (const file of fs.readdirSync(path.join(root, 'site')).filter((f) => f.endsWith('.js'))) {
  const js = read(`site/${file}`);
  if (/\sstyle\s*=\s*["'`$]/.test(js)) fail(`style attribute in site/${file} (set styles through the CSSOM)`);
  if (/\son[a-z]+\s*=\s*["'`]/.test(js)) fail(`inline event handler in site/${file}`);
  if (/\beval\s*\(|new Function\s*\(/.test(js)) fail(`eval in site/${file} (script-src has no unsafe-eval)`);
}

if (!process.exitCode) console.log('hosting:check: ok');
