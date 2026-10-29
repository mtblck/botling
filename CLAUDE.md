# botling

Seeded robot avatars as SVG. Zero runtime dependencies, ESM only, TypeScript.

- `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`. Run all four before a PR.
- Playground site: `site/` (plain HTML/CSS/JS, no framework), built by `npm run site` into `dist-site/` with the package's own `dist/` copied to `/lib`. `npm run serve` serves it with `vercel.json`'s headers. CSP is `script-src 'self'` and `style-src 'self'`: no inline scripts, handlers or style attributes (`npm run hosting:check` guards it). Seeds live in the URL hash, never the query, so they don't reach the server or analytics.
- Commit as `mtblck <105079242+mtblck@users.noreply.github.com>`: Vercel blocks deploys whose author email isn't linked to Matt's account.
- `npm run preview [count]` writes `preview.html`, a contact sheet at 24/48/96px in every shape. Look at it for any art change, at 24px especially.
- **Output is the API.** A seed must keep drawing the same robot within a major version. Anything that changes an existing seed's SVG (trait draw order, list order, palette colours, part drawing, cell geometry) is a major change; the snapshot tests in `test/__snapshots__` catch it. Appending to a parts list or palette list also changes existing seeds, because picks are by index over the list length.
- Keep TypeScript files under 200 lines and give exported functions JSDoc and explicit return types.
- Don't publish to npm; the maintainer publishes from their own account.
