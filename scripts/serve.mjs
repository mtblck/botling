// npm run serve: serves dist-site/ on http://localhost:4173 with vercel.json's headers,
// so the CSP is tested locally exactly as Vercel will send it.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const root = path.resolve('dist-site');
const config = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};
const port = Number(process.env.PORT ?? 4173);

http
  .createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    let file = path.join(root, decodeURIComponent(url.pathname));
    if (!file.startsWith(root)) return res.writeHead(403).end();
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) return res.writeHead(404).end('not found');
    for (const rule of config.headers) {
      if (new RegExp(`^${rule.source}$`).test(url.pathname))
        for (const h of rule.headers) res.setHeader(h.key, h.value);
    }
    res.setHeader('Content-Type', TYPES[path.extname(file)] ?? 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, () => console.log(`serving dist-site on http://localhost:${port}`));
