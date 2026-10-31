// Syntax highlighting for the site's code samples: ts, tsx, js, html, vue, svelte and sh. The
// build runs it over every <code class="language-…"> (scripts/site.mjs) so pages ship coloured
// spans and no highlighter; the playground runs it on the code it writes. Classes are styled in
// site.css, in both themes. Pure functions, tested in test/highlight.test.ts.

const KEYWORDS = new Set(
  'as async await break case catch class const default else export extends false for from function if import in interface let new null of return switch this throw true try type typeof undefined var while string number boolean'.split(
    ' ',
  ),
);
const escapeHtml = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** A scanner over `s` that collects [start, end, class] spans. */
function scanner(s, from = 0) {
  const spans = [];
  const sc = {
    i: from,
    spans,
    /** Matches a sticky regex at the cursor; on a match, moves past it and returns the text. */
    eat(re, cls) {
      re.lastIndex = sc.i;
      const m = re.exec(s);
      if (!m || m[0] === '') return null;
      if (cls) spans.push([sc.i, sc.i + m[0].length, cls]);
      sc.i += m[0].length;
      return m[0];
    },
  };
  return sc;
}

const RE = {
  space: /\s+/y,
  line: /\/\/[^\n]*/y,
  block: /\/\*[\s\S]*?(?:\*\/|$)/y,
  str: /'(?:\\.|[^'\\\n])*'?|"(?:\\.|[^"\\\n])*"?|`(?:\\.|[^`\\])*`?/y,
  num: /\d[\d_.]*/y,
  id: /[A-Za-z_$][\w$]*/y,
  tag: /<\/?(?=[A-Za-z])/y,
  tagName: /[\w.:-]+/y,
  attr: /[@:#]?[\w.:-]+/y,
  any: /[\s\S]/y,
  next: /\s*(\S)/y,
};

/** JavaScript and TypeScript, with JSX tags when `jsx` is set, from `sc.i` up to `end`. */
function js(s, sc, jsx, end = s.length) {
  let value = false; // the last token was a value, so a `<` after it compares
  let inTag = false;
  let depth = 0;
  while (sc.i < end) {
    if (sc.eat(RE.space)) continue;
    if (sc.eat(RE.line, 'c') || sc.eat(RE.block, 'c')) continue;
    if (sc.eat(RE.str, 's')) {
      value = true;
      continue;
    }
    if (sc.eat(RE.num, 'n')) {
      value = true;
      continue;
    }
    if (jsx && !value && !inTag && sc.eat(RE.tag)) {
      sc.eat(RE.tagName, 't');
      inTag = true;
      continue;
    }
    const at = sc.i;
    const word = sc.eat(RE.id);
    if (word) {
      RE.next.lastIndex = sc.i;
      const next = RE.next.exec(s)?.[1];
      const cls = KEYWORDS.has(word) ? 'k' : inTag && depth === 0 && next === '=' ? 'a' : next === '(' ? 'f' : null;
      if (cls) sc.spans.push([at, sc.i, cls]);
      value = !(cls === 'k' && !['this', 'true', 'false', 'null', 'undefined'].includes(word));
      continue;
    }
    // Braces only count inside a tag, where they hold an expression and a `>` doesn't end it.
    const ch = sc.eat(RE.any);
    if (inTag && ch === '{') depth++;
    else if (inTag && ch === '}') depth = Math.max(0, depth - 1);
    else if (inTag && ch === '>' && depth === 0) inTag = false;
    value = ch === ')' || ch === ']';
  }
}

/** HTML, Vue and Svelte: tags, attributes, values and comments, with script contents as TypeScript. */
function html(s, sc) {
  while (sc.i < s.length) {
    if (sc.eat(/<!--[\s\S]*?(?:-->|$)/y, 'c')) continue;
    if (!sc.eat(RE.tag)) {
      sc.eat(/[^<]+|</y);
      continue;
    }
    const name = sc.eat(RE.tagName, 't') ?? '';
    const close = s[sc.i - name.length - 1] === '/';
    while (sc.i < s.length && !sc.eat(/\/?>/y)) {
      if (sc.eat(RE.space)) continue;
      if (sc.eat(RE.str, 's')) continue;
      if (sc.eat(RE.attr, 'a')) continue;
      sc.eat(RE.any);
    }
    if (name === 'script' && !close) {
      const stop = s.indexOf('</script', sc.i);
      js(s, sc, false, stop === -1 ? s.length : stop);
    }
  }
}

/** Shell: comments, the command at the start of each line, flags and strings. */
function sh(s, sc) {
  let start = true;
  while (sc.i < s.length) {
    if (sc.eat(/#[^\n]*/y, 'c') || sc.eat(RE.str, 's')) continue;
    if (sc.eat(/\n/y)) {
      start = true;
      continue;
    }
    if (sc.eat(/[ \t]+/y)) continue;
    if (start && sc.eat(/[\w.-]+/y, 'f')) start = false;
    else if (!sc.eat(/--?[\w-]+/y, 'a')) sc.eat(/[^\s'"]+|[\s\S]/y);
  }
}

/**
 * Highlights code as HTML: the code escaped, with each token in a `<span class="tok-…">`.
 *
 * @param {string} code - The code, as plain text
 * @param {string} lang - ts, tsx, js, jsx, html, vue, svelte or sh; anything else is escaped only
 * @returns {string} HTML
 */
export function highlight(code, lang) {
  const sc = scanner(code);
  if (['ts', 'js'].includes(lang)) js(code, sc, false);
  else if (['tsx', 'jsx'].includes(lang)) js(code, sc, true);
  else if (['html', 'vue', 'svelte'].includes(lang)) html(code, sc);
  else if (lang === 'sh') sh(code, sc);
  let out = '';
  let at = 0;
  for (const [from, to, cls] of sc.spans) {
    out += `${escapeHtml(code.slice(at, from))}<span class="tok-${cls}">${escapeHtml(code.slice(from, to))}</span>`;
    at = to;
  }
  return out + escapeHtml(code.slice(at));
}

const decode = (s) =>
  s.replace(/&(?:#(\d+)|#x([\da-f]+)|(amp|lt|gt|quot|apos));/gi, (_, dec, hex, name) =>
    dec || hex
      ? String.fromCodePoint(Number.parseInt(dec ?? hex, dec ? 10 : 16))
      : { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }[name.toLowerCase()],
  );

/**
 * Highlights every `<code class="language-…">` in a page. Code that already holds markup is
 * left alone.
 *
 * @param {string} page - HTML
 * @returns {string} The page, highlighted
 */
export function highlightPage(page) {
  return page.replace(
    /(<code\b[^>]*\bclass="language-([\w-]+)"[^>]*>)([^<]*)(<\/code>)/g,
    (_, open, lang, code, close) => open + highlight(decode(code), lang) + close,
  );
}
