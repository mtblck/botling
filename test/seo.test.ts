import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { styleOgImage } from '../scripts/og.mjs';
import { jsonLd, llms, pageInfo, robots, sitemap } from '../scripts/seo.mjs';
import * as noggin from '../src/styles/noggin/index.js';

const pages = fs
  .readdirSync('site', { recursive: true })
  .map(String)
  .filter((f) => f.endsWith('.html') && !f.startsWith('partials'))
  .map((f) => ({ file: f.split(path.sep).join('/'), html: fs.readFileSync(path.join('site', f), 'utf8') }));

describe('seo', () => {
  it('gives every page its own title and description, and every indexed page a canonical URL and og tags', () => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    for (const { file, html } of pages) {
      const { url, title, description, noindex } = pageInfo(html);
      expect(title, file).toBeTruthy();
      if (noindex) continue;
      expect(description, file).toBeTruthy();
      expect(titles.has(title ?? ''), `${file} repeats the title ${title}`).toBe(false);
      expect(descriptions.has(description ?? ''), `${file} repeats a description`).toBe(false);
      titles.add(title ?? '');
      descriptions.add(description ?? '');
      const where = file.replace(/index\.html$/, '');
      expect(url, file).toBe(`https://seedkin.dev/${where}`);
      expect(html, file).toContain(`<meta property="og:url" content="${url}" />`);
      expect(html, file).toMatch(/<meta property="og:title" content="[^"]+" \/>/);
      expect(html, file).toMatch(/<meta property="og:description" content="[^"]+" \/>/);
    }
  });

  it('reads a page head, unescaping entities', () => {
    const info = pageInfo(
      '<title>A &amp; B</title><meta name="description" content="It&#39;s" /><link rel="canonical" href="https://seedkin.dev/x/" />',
    );
    expect(info).toEqual({ url: 'https://seedkin.dev/x/', title: 'A & B', description: "It's", noindex: false });
    expect(pageInfo('<meta name="robots" content="noindex" />').noindex).toBe(true);
  });

  it('lists URLs in the sitemap and points robots.txt at it', () => {
    expect(sitemap(['https://seedkin.dev/b/', 'https://seedkin.dev/a/'])).toContain(
      '<url><loc>https://seedkin.dev/a/</loc></url>\n  <url><loc>https://seedkin.dev/b/</loc></url>',
    );
    expect(robots()).toContain('Sitemap: https://seedkin.dev/sitemap.xml');
  });

  it('writes llms.txt with the version and every page', () => {
    const txt = llms({
      version: '9.9.9',
      sections: [
        { name: 'Docs', pages: [{ url: 'https://seedkin.dev/docs/', title: 'Intro', description: 'Start here.' }] },
      ],
    });
    expect(txt.startsWith('# Seedkin\n\n> ')).toBe(true);
    expect(txt).toContain('Current version: 9.9.9.');
    expect(txt).toContain('## Docs\n\n- [Intro](https://seedkin.dev/docs/): Start here.');
  });

  it("writes JSON-LD that can't close its own element", () => {
    const block = jsonLd({ version: '1.0.0', description: 'a </script><script>alert(1)' });
    expect(block.match(/<\/script>/g)).toHaveLength(1);
    const json = JSON.parse(block.replace(/^<script[^>]*>|<\/script>$/g, ''));
    expect(json).toMatchObject({ '@type': 'SoftwareSourceCode', version: '1.0.0' });
    expect(json.description).toBe('a </script><script>alert(1)');
  });

  it("draws a style's link preview card as a 1200x630 PNG", () => {
    const png = styleOgImage(noggin);
    expect(png.subarray(1, 4).toString()).toBe('PNG');
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630]);
    expect(png.length).toBeLessThan(100_000);
  });
});
