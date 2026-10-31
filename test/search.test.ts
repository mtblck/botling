import { describe, expect, it } from 'vitest';
import { searchEntries } from '../scripts/search.mjs';
import { find, type SearchEntry } from '../site/find.js';

const INDEX: SearchEntry[] = [
  { url: '/docs/react/', title: 'React', page: 'React', text: 'An avatar component.' },
  { url: '/docs/react/#inline-svg', title: 'Inline SVG', page: 'React', text: '' },
  { url: '/docs/botling/', title: 'Botling', page: 'Botling', text: 'Every option, frames and animation.' },
  { url: '/docs/botling/#frames', title: 'Frames', page: 'Botling', text: '' },
  { url: '/docs/server/', title: 'On the server', page: 'On the server', text: 'Serve avatars as image URLs.' },
];

describe('site search', () => {
  it('ranks a title match above a match in the text', () => {
    expect(find(INDEX, 'frames').map((e) => e.url)).toEqual(['/docs/botling/#frames', '/docs/botling/']);
  });

  it('needs every word to match, in any field', () => {
    expect(find(INDEX, 'inline react').map((e) => e.url)).toEqual(['/docs/react/#inline-svg']);
    expect(find(INDEX, 'react vue')).toEqual([]);
  });

  it('ignores case, accents and punctuation, and an empty query', () => {
    expect(find(INDEX, 'SÉRVER!')[0]?.url).toBe('/docs/server/');
    expect(find(INDEX, '  ')).toEqual([]);
  });

  it('stops at the limit', () => {
    expect(find(INDEX, 'a', 2)).toHaveLength(2);
  });

  it('indexes a page and its headings, without markup or badges', () => {
    const entries = searchEntries({
      path: '/docs/snoot/',
      title: 'Snoot',
      description: 'Animals.',
      html: '<h1>Snoot</h1><h2 id="use">Use <code>snoot()</code></h2><h3 id="x">Tips &amp; tricks <span class="badge">Preview</span></h3><h2>No id</h2>',
    });
    expect(entries).toEqual([
      { url: '/docs/snoot/', title: 'Snoot', page: 'Snoot', text: 'Animals.' },
      { url: '/docs/snoot/#use', title: 'Use snoot()', page: 'Snoot', text: '' },
      { url: '/docs/snoot/#x', title: 'Tips & tricks', page: 'Snoot', text: '' },
    ]);
  });
});
