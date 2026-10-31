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

Sprite (elemental spirits) started here too and is now `src/styles/sprite/`.
