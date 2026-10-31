/** Inline Markdown: `code`, **bold** and [text](url), with everything else escaped. */
export function inline(text: string): string;
/** A version's anchor: '2.2.0' becomes 'v2-2-0', Unreleased becomes 'unreleased'. */
export function anchor(version: string): string;
/** The changelog as HTML, without its title and preamble, and the versions it lists. */
export function changelog(markdown: string): { html: string; versions: string[] };
