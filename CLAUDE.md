# botling

Seeded robot avatars as SVG. Zero runtime dependencies, ESM only, TypeScript.

- `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`. Run all four before a PR.
- `npm run preview [count]` writes `preview.html`, a contact sheet at 24/48/96px in every shape. Look at it for any art change, at 24px especially.
- **Output is the API.** A seed must keep drawing the same robot within a major version. Anything that changes an existing seed's SVG (trait draw order, list order, palette colours, part drawing, cell geometry) is a major change; the snapshot tests in `test/__snapshots__` catch it. Appending to a parts list or palette list also changes existing seeds, because picks are by index over the list length.
- Keep files under 200 lines and give exported functions JSDoc and explicit return types.
- Don't publish to npm; the maintainer publishes from their own account.
