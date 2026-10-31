// CHANGELOG.md as HTML for /changelog/, at site build time. It reads the subset of Markdown
// the changelog uses (Keep a Changelog): headings, paragraphs, one-line list items, inline
// code, bold and links, plus the reference links that make each version heading a link.
// Anything else is a mistake in the changelog, so it throws rather than guessing.

const escapeHtml = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** Inline Markdown: `code`, **bold** and [text](url), with everything else escaped. */
export function inline(text) {
  return text
    .split(/(`[^`]+`)/)
    .map((part) => {
      if (part.startsWith('`') && part.endsWith('`') && part.length > 1)
        return `<code>${escapeHtml(part.slice(1, -1))}</code>`;
      return escapeHtml(part)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g, '<a href="$2">$1</a>');
    })
    .join('');
}

/** A version's anchor: '2.2.0' becomes 'v2-2-0', Unreleased becomes 'unreleased'. */
export const anchor = (version) => (/^\d/.test(version) ? `v${version.replaceAll('.', '-')}` : version.toLowerCase());

/**
 * The changelog as HTML, without its title and preamble, and the versions it lists.
 *
 * @param {string} markdown - CHANGELOG.md
 * @returns {{ html: string, versions: string[] }} The body, and every version heading's name
 */
export function changelog(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const refs = Object.fromEntries(
    lines.flatMap((l) => {
      const m = /^\[([^\]]+)\]: (https:\/\/\S+)$/.exec(l);
      return m ? [[m[1], m[2]]] : [];
    }),
  );
  const start = lines.findIndex((l) => l.startsWith('## '));
  if (start === -1) throw new Error('CHANGELOG.md has no version headings');
  const out = [];
  const versions = [];
  let list = false;
  // A version with nothing under it yet (Unreleased, just after a release) is left out.
  const dropEmpty = () => {
    if (out.at(-1)?.startsWith('<h2 ')) {
      out.pop();
      versions.pop();
    }
  };
  const closeList = () => {
    if (list) out.push('</ul>');
    list = false;
  };
  for (const line of lines.slice(start)) {
    if (/^\[[^\]]+\]: /.test(line)) continue;
    const version = /^## \[([^\]]+)\](?: - (\d{4}-\d{2}-\d{2}))?$/.exec(line);
    if (version) {
      closeList();
      dropEmpty();
      const [, name, date] = version;
      versions.push(name);
      const title = refs[name] ? `<a href="${refs[name]}">${escapeHtml(name)}</a>` : escapeHtml(name);
      const time = date ? ` <time datetime="${date}">${date}</time>` : '';
      out.push(`<h2 id="${anchor(name)}">${title}${time}</h2>`);
    } else if (line.startsWith('### ')) {
      closeList();
      out.push(`<h3>${inline(line.slice(4))}</h3>`);
    } else if (line.startsWith('- ')) {
      if (!list) out.push('<ul>');
      list = true;
      out.push(`<li>${inline(line.slice(2))}</li>`);
    } else if (line.trim() === '') {
      closeList();
    } else if (/^([#>*|`\s]|\d+\. )/.test(line)) {
      throw new Error(`CHANGELOG.md has Markdown the site can't show: ${line}`);
    } else {
      closeList();
      out.push(`<p>${inline(line)}</p>`);
    }
  }
  closeList();
  dropEmpty();
  return { html: out.join('\n'), versions };
}
