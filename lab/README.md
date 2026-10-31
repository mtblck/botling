# Lab: other avatar families

Prototypes of animals, people, monsters and dinosaurs drawn the robot way: a
seed picks traits, the traits paint a 15x15 grid of the five `Role`s, and the
package's own cell, path and frame code renders it. Nothing here is exported
or published (`files` is `dist` only) and none of it touches the robots.

- `kinds/`: one module per family, plus `art.ts` (stamp and blob helpers) and `palettes.ts`.
- `render.ts`: renders a family with `src/render`'s cells and frames.
- `npx tsx lab/sheet.ts out.html [count]`: a quick contact sheet of every family.
- `node lab/page.mjs out.html`: the interactive comparison page (seed box, shapes, walls, plan).

Seeds are salted per family (`animal:` + seed). The art is unfrozen: change anything.

The families are named Snoot (animals), Noggin (people) and Beastie (monsters); dinosaurs
are parked. Snoot has moved into the package (`src/styles/snoot/`, `seedkin/snoot`), and
`kinds/animal.ts` now draws from there. `preview.ts` is what the site bundles to show
the rest as previews.

`sprites/` is Sprite, elemental spirits (fire, water, earth, wind and space), the next
style in the lab and the one `preview.ts` shows on /styles/ as Coming soon. Each element
has two forms in `sprites/forms/`, drawn on the 15x15 and 9x9 grids in four frames, and
`sprites/face.ts` paints the seeded face. Seeds are salted after the seed (`seed + ':sprite'`),
so seeds that differ in their last character don't look alike.
`npx tsx lab/sprites/sheet.ts out.html` is a contact sheet; `npx tsx lab/sprites/page.ts out.html`
is the concept page.
