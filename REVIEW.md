# Review focus

Read by the `pr-review` skill (from the base branch) on top of CLAUDE.md.

## What matters most here

- Anything that changes the robot an existing seed draws (snapshot changes, parts
  lists, palettes, trait draw order). That is a major version: the PR must say so
  and the CHANGELOG must record it (docs/adr/0001).
- Anything that could put a seed, or unescaped text, into the SVG output.
- The playground's CSP and headers (`vercel.json`, `npm run hosting:check`).

## Performance

- The package has zero runtime dependencies; keep it that way.
- A 96px robot with the grid shown is about 9-14 KB of SVG; flag changes that
  grow it by more than 10%.

## Don't flag

- Copy on the playground page; Matt edits that by hand.
