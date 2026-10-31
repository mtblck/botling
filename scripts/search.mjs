// The site search's index, /search.json, built by site.mjs from every indexed page: the page
// itself (title and description) and each of its h2 and h3 headings. site/find.js matches it.

const plain = (html) =>
  html
    .replace(/<span class="badge[^"]*">.*?<\/span>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&(amp|lt|gt|quot|#39);/g, (_, e) => ({ amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" })[e])
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Search entries for one page.
 *
 * @param {{ path: string, title: string, description: string, html: string }} page - Its path
 *   (such as /docs/react/), its title without the site name, its description, and its HTML
 * @returns {{ url: string, title: string, page: string, text: string }[]} The page, then its headings
 */
export function searchEntries({ path, title, description, html }) {
  const heads = [...html.matchAll(/<h([23]) id="([^"]+)">(.*?)<\/h\1>/g)].map(([, , id, inner]) => ({
    url: `${path}#${id}`,
    title: plain(inner),
    page: title,
    text: '',
  }));
  return [{ url: path, title, page: title, text: description }, ...heads];
}
