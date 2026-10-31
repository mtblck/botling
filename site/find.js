// The site search's matching, pure so test/site.test.ts can check it; site/search.js draws
// the dialog. The index is built by scripts/search.mjs: one entry per page and per heading.

const words = (s) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);

/**
 * The entries that match every word of a query, best first: a word that starts a word in
 * the title counts most, then one anywhere in the title, then in the page and its text.
 *
 * @param {{ url: string, title: string, page: string, text: string }[]} index - From /search.json
 * @param {string} query - What was typed
 * @param {number} [limit] - How many to return
 * @returns {{ url: string, title: string, page: string, text: string }[]} The matches
 */
export function find(index, query, limit = 8) {
  const terms = words(query);
  if (!terms.length) return [];
  const scored = [];
  for (const [order, entry] of index.entries()) {
    const title = words(entry.title);
    const rest = words(`${entry.page} ${entry.text}`);
    let score = 0;
    for (const term of terms) {
      if (title.some((w) => w.startsWith(term))) score += 3;
      else if (title.some((w) => w.includes(term))) score += 2;
      else if (rest.some((w) => w.includes(term))) score += 1;
      else {
        score = 0;
        break;
      }
    }
    // A whole page outranks one of its headings with the same score.
    if (score) scored.push({ entry, score: score * 2 + (entry.url.includes('#') ? 0 : 1), order });
  }
  return scored
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, limit)
    .map((s) => s.entry);
}
