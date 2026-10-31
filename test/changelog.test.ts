import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { anchor, changelog, inline } from '../scripts/changelog.mjs';

describe('changelog page', () => {
  it('reads all of CHANGELOG.md, newest version first, each with a link', () => {
    const md = fs.readFileSync('CHANGELOG.md', 'utf8');
    const { html, versions } = changelog(md);
    expect(versions).toContain(JSON.parse(fs.readFileSync('package.json', 'utf8')).version);
    expect(versions.at(-1)).toBe('0.1.0');
    for (const v of versions) expect(html, v).toMatch(new RegExp(`<h2 id="${anchor(v)}"><a href="https://`));
    expect(html).not.toContain('{{');
  });

  it('leaves out a version with nothing in it yet', () => {
    const { versions } = changelog('## [Unreleased]\n\n## [1.0.0]\n\n- One\n\n## [0.1.0]\n');
    expect(versions).toEqual(['1.0.0']);
  });

  it('escapes HTML, outside code and in it', () => {
    expect(inline('a <b> & `<svg>` **bold** [x](https://e.com)')).toBe(
      'a &lt;b&gt; &amp; <code>&lt;svg&gt;</code> <strong>bold</strong> <a href="https://e.com">x</a>',
    );
  });

  it('turns versions into headings with dates, and lists into lists', () => {
    const { html } = changelog('# C\n\nIntro\n\n## [1.0.0] - 2026-01-02\n\n### Added\n\n- One\n- Two\n\nAfter.\n');
    expect(html).toBe(
      '<h2 id="v1-0-0">1.0.0 <time datetime="2026-01-02">2026-01-02</time></h2>\n<h3>Added</h3>\n<ul>\n<li>One</li>\n<li>Two</li>\n</ul>\n<p>After.</p>',
    );
  });

  it("throws on Markdown it can't show, rather than mangle it", () => {
    expect(() => changelog('## [1.0.0]\n\n  - nested\n')).toThrow(/can't show/);
    expect(() => changelog('## [1.0.0]\n\n```ts\nx\n```\n')).toThrow(/can't show/);
  });
});
