# Changelog

All notable changes to this project are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/) with the output rule in the README:
any change to the robot a seed draws is a major version.

## [Unreleased]

## [2.3.0] - 2026-10-31

### Added

- A `look` option for every style: `'gapped'` (the default, unchanged), `'flat'` (no gap, so cells merge into solid shapes), `'inked'` (flat with a dark outline and lines between colours), `'soft'` (rounded, vector-like shapes), `'soft-inked'` and `'sticker'` (a white border and a drop shadow). `LOOKS` lists them. A seed draws the same picture in every look, and no existing output changes (ADR 0010).

### Site

- Every playground has a Look picker, and the copied code includes the look.
- The docs are now thirteen pages with a sidebar, an "On this page" list, previous and next links and an edit link: an introduction, guides for React, Vue, Svelte, plain HTML, serving avatars from a server and using them as a profile photo fallback, a page per style, How it works and Versioning. Old `/docs/#section` links go to the section's new page.
- Every style page is built from one template (`scripts/styles.mjs`): the playground, then usage tabs (ESM, React, HTML, server), a details list with the entry point, status, gzipped size measured at build and the parts counted from the package, the style's options table, and links to the previous and next style. The Styles page links each style's playground and docs.

## [2.2.0] - 2026-10-31

### Added

- `seedkin/beastie`, the Beasties: seeded monster avatars (blobs, ghosts, boxes, tall and wide bodies with one to three eyes, eyes on stalks, fangs, horns, antennae, arms and wings) in eight hides, with `beastie()`, `beastieDataUri()` and the same options as `snoot()`. Below 40px it draws a simpler 9x9 Beastie from the same traits. Beastie is a Preview style: the Beastie a seed draws can change in a minor version until it's marked stable (ADR 0009). Botling and Snoot are unchanged.
- `seedkin/noggin`, the Noggins: seeded people avatars in seven skin tones, with twelve hairstyles (including afros and locs), glasses, beards, hats and headscarves, in six outfits. `noggin()` and `nogginDataUri()` take the same options as `snoot()` plus `skin`, so people can pick their own skin tone; hair and outfit always stand out from the skin. Below 40px it draws a simpler 9x9 Noggin. Noggin is a Preview style.

### Site

- seedkin.dev has a fuller header (Playground, Styles, Docs, About) that folds into a menu on phones, a footer with Explore, Docs, Project and Versions columns, and a 404 page.
- The landing page gains calls to action, an at-a-glance strip with figures measured at build time, mock-ups of comments, a leaderboard and a team list drawn with real avatars, and a Why Seedkin grid.
- New `/about/` page: the four promises, how Seedkin compares with similar libraries, and the Grid's backstory.
- Every code sample has a Copy button, and install commands have npm, pnpm, yarn and bun tabs.
- The playground is one shared page layout (`site/playground.js`) for every style: the options sit beside the avatar, which stays in view while they change (pinned in a compact bar on phones), with the code and downloads under it, tabs between styles, a Reset button, and a gallery that redraws with the options on screen. Snoot gains PNG, JPG and GIF downloads.
- Beastie and Noggin get playgrounds at `/styles/beastie/` and `/styles/noggin/` (Noggin with a skin tone picker), and the landing and Styles pages draw both from the package. No lab styles are left on the site.

## [2.1.0] - 2026-10-31

### Added

- `seedkin/snoot`, the Snoots: seeded animal avatars (cats, foxes, bears, bunnies, mice, dogs, pandas, owls, frogs and pigs) in eight coats, with `snoot()`, `snootDataUri()` and the same options as `botling()` bar `animate`. Below 40px it draws a simpler 9x9 Snoot from the same traits. Snoot is a Preview style: the Snoot a seed draws can change in a minor version until it's marked stable (ADR 0009). Botling is unchanged.
- seedkin.dev has a Snoot playground at `/styles/snoot/`, and the landing and Styles pages draw Snoots from the package.

## [2.0.0] - 2026-10-31

The first release of `seedkin`. It carries on from `botling` 1.2.0, the last release under that name, so its versions start at 2.0.0; everything below this is `botling`.

### Changed

- **Breaking:** the package is now `seedkin`, a family of avatar styles, and the robots are its first style, Botling. Import them from `seedkin/botling`, which exports everything `botling` did and draws every seed exactly as `botling` 1.2.0 does. The root `seedkin` export holds what every style shares: `randomSeed`, `FRAMES`, `Role`, the grid sizes and the shared types. See ADR 0009.

### Added

- The site moves to seedkin.dev and grows from one playground into a family site: a landing page that grows your seed in every style, a Styles page, the Botling playground at `/styles/botling/` under "Meet the Botlings", and the docs at `/docs/`. Snoots, Noggins and Beasties show there as previews; they aren't in the package yet. botling.me redirects to the Botling playground.
- The playground downloads the robot as SVG, PNG, JPG or GIF. PNG and JPG are the still robot at 512px (JPG puts white behind a rounded frame's corners); the GIF is 256px and, with Motion on, one seamless loop of the animation. The package itself is unchanged.

## [1.2.0] - 2026-10-30

### Added

- A `frame` option draws the background as a `'square'` (the default, unchanged), `'rounded'`, `'squircle'` or `'circle'`, with transparent corners. A circle crops the robot, a squircle draws it at 92% so wide shoulders fit, and the grid keeps only the whole cells inside the frame. `FRAMES` lists them. Without `frame`, every robot draws exactly as before.
- The playground has a Frame control, and its robots now show the frame they're drawn with instead of a rounded corner added by the page.

## [1.1.0] - 2026-10-30

### Added

- `randomSeed()` returns a readable random seed, like `plucky-servo-427`, to store and draw a robot from. It uses `crypto.getRandomValues` where available and takes an optional source of randomness. No existing seed's robot changes.
- The playground's Random button and its gallery of robots use it; the words are the same, and the number now runs to 999.

## [1.0.0] - 2026-10-30

The robot each seed draws is now frozen for the whole of 1.x: the same seed and options draw the same picture until 2.0. [ADR 0006](https://github.com/mtblck/seedkin/blob/main/docs/adr/0006-what-1-0-freezes.md) lists what is frozen and what a minor version may still change, and a golden corpus of 500 seeds checks it on every change.

### Changed

- Seeds are normalised to Unicode NFC before hashing, so an accented letter draws the same robot whether it was typed as one character or as a letter plus a combining accent. ASCII seeds, and any seed already in NFC (what keyboards normally produce), keep their robot.
- Three palettes stand out more from their tiles, chosen side by side before 1.0: Night shift and Lemon have a stronger head edge, ears and neck, and Indigo's body is lighter, which also lifts the face on robots without a screen. This recolours robots in those palettes, about 19% of seeds.
- `HEADS`, `EYES` and the other parts lists are frozen at runtime, like `PALETTES`, so an app can't change them and redraw every robot.

### Added

- ADR 0006 and a README Versioning section: what 1.0 freezes, and what a minor version may still change.
- README: an Advanced section documenting `resolveTraits`, `grid`, `smallGrid`, `Role` and the grid sizes, and a note on how seeds are used.
- A contrast test holds every built-in and holiday palette to the weakest pair kept at 1.0.
- A golden corpus test pins 500 seeds in every shape, at full and small size, still and animated.

### Fixed

- README: the palette index runs from 0 to 15, not 0 to 11.

## [0.2.0] - 2026-10-29

### Added

- `animate: true`: the robot hovers, blinks (sometimes twice) and talks, its top piece wobbles, its ears, handles and bolts twitch, and a scanline sweeps its screen. Below 40px it only blinks and hovers. It's CSS inside the SVG, so it works as an `<img>` or `data:` URI, and it holds still for `prefers-reduced-motion`. Off by default.
- The playground has a Motion toggle.

### Changed

- On the tallest heads the antenna (and the off-side antenna quirk) is one cell shorter, so its tip no longer sits on the tile's top edge. This redraws the antenna for about 6% of seeds.
- A robot without shoulders is centred top to bottom, to the row (to two rows on triangle cells, which flip every row). Short robots used to sit high in their tile; about 20% of seeds move down, or now and then up, by a cell or two.

## [0.1.0] - 2026-10-29

First release.

### Added

- `botling(seed, options)` renders a seeded robot as an SVG string.
- `botlingDataUri(seed, options)` returns the same SVG as a `data:` URI.
- Square, circle, triangle and diamond cell grids.
- 16 palettes (four of them two-tone), 7 heads, 14 eyes, 11 mouths, 7 tops and 4 side pieces.
- Expressions: happy, winking, angry and surprised eyes; frown, grin and zigzag mouths.
- Now and then a head marking (forehead stripe, rivets, chin panel), a one-sided quirk (one ear, a dent, a patch, an off-centre antenna), an accessory (headphones, visor band, bow, cap) or a chest light. `PATTERNS`, `QUIRKS` and `ACCESSORIES` list them.
- Parts drawn for a cell shape: round heads and ring eyes on circles, stepped domes and chevron eyes on triangles.
- `traits`, `grid`, `resolveTraits` and the part lists for building pickers.
- `showGrid: 'auto'` hides the empty grid below 40px.
- `HOLIDAY_PALETTES` (New Year's, Valentine's, St Patrick's, Fourth of July, Halloween, Christmas), and `palette` accepts a palette object as well as an index. Seeds never pick a holiday palette.
- `detail` option and `smallGrid()`: below 40px (`detail: 'auto'`), a simpler 9x9 robot from the same traits with touching cells, so 24px avatars stay readable.
- Compact output: each colour is one `<path>`, so a 96px robot with the grid is about 2-7 KB and a 24px one under 2.5 KB.
- Requires Node 22 or newer (Node 20 reached end of life in April 2026).

The playground site (`site/`, not part of the npm package) lets you try seeds, shapes and palettes and copy the code.

[Unreleased]: https://github.com/mtblck/seedkin/compare/v2.3.0...HEAD
[2.3.0]: https://github.com/mtblck/seedkin/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/mtblck/seedkin/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/mtblck/seedkin/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/mtblck/seedkin/compare/v1.2.0...v2.0.0
[1.2.0]: https://github.com/mtblck/seedkin/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/mtblck/seedkin/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/mtblck/seedkin/compare/v0.2.0...v1.0.0
[0.2.0]: https://github.com/mtblck/seedkin/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/mtblck/seedkin/releases/tag/v0.1.0
