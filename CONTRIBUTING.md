# Contributing

Thanks for looking. botling is a side project with one maintainer, so replies
can take a few days. A playground link or the exact `botling()` call that shows
a problem is the most useful thing you can send.

## Setting up

Node 22 or newer and npm.

```bash
npm install
npm test            # vitest, including snapshot tests that pin known seeds
npm run lint        # biome
npm run typecheck
npm run build       # the package, into dist/
npm run preview     # preview.html: every shape at 24, 32, 48 and 96px
npm run site        # the playground, into dist-site/
npm run serve       # serves it on localhost:4173 with the production headers
```

## The one rule: the picture is the API

People store nothing but a seed, so a seed must keep drawing the same robot.
Anything that changes an existing seed's robot is a **major version**: art,
palette colours, and the order *or length* of any parts list (seeds pick by
index over the list length, so even appending changes robots). The snapshot
tests catch it; if you change them on purpose, say so in the PR and the
CHANGELOG. Before 1.0, art changes are batched freely.

For any art change, open `preview.html` and look at 24px first. Most avatars
are shown small.

## Where things live

| Path | What |
| --- | --- |
| `src/traits.ts` | Seed to traits (draw order is part of the output contract) |
| `src/grid/` | Traits to a 15x15 grid of roles (head, face, extras) |
| `src/grid/small/` | The simpler 9x9 robot drawn below 40px |
| `src/render/` | Roles to SVG: cell shapes, colours, options |
| `site/` | The playground page; `scripts/site.mjs` builds it |
| `docs/` | Overview and decision records (`docs/adr/`) |

## Pull requests

Open a draft, fill in the template, and mark it ready when CI is green. Keep
TypeScript files under 200 lines, give exported functions JSDoc, and add a
test that fails without your change.
