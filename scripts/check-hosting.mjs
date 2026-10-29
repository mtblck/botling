// npm run hosting:check: fails if vercel.json's security headers or CSP regress, or if the
// site sources pick up an inline script or handler the CSP would block.
import fs from 'node:fs';

const fail = (msg) => {
  console.error(`hosting:check: ${msg}`);
  process.exitCode = 1;
};
const config = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
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

const html = fs.readFileSync('site/index.html', 'utf8');
for (const tag of html.match(/<script\b[^>]*>/g) ?? [])
  if (!/\bsrc=/.test(tag)) fail(`inline script in site/index.html: ${tag}`);
if (/\son[a-z]+\s*=/i.test(html)) fail('inline event handler in site/index.html');
if (/\sstyle\s*=/i.test(html)) fail("style attribute in site/index.html (style-src is 'self')");

if (!process.exitCode) console.log('hosting:check: ok');
