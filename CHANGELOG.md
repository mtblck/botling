# Changelog

All notable changes to this project are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/) with the output rule in the README:
any change to the robot a seed draws is a major version.

## [Unreleased]

### Changed

- Seeds are normalised to Unicode NFC before hashing, so an accented letter draws the same robot whether it was typed as one character or as a letter plus a combining accent. ASCII seeds, and any seed already in NFC (what keyboards normally produce), keep their robot.
- `HEADS`, `EYES` and the other parts lists are frozen at runtime, like `PALETTES`, so an app can't change them and redraw every robot.

### Added

- ADR 0006 and a README Versioning section: what 1.0 freezes, and what a minor version may still change.
- README: an Advanced section documenting `resolveTraits`, `grid`, `smallGrid`, `Role` and the grid sizes, and a note on how seeds are used.
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

[Unreleased]: https://github.com/mtblck/botling/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/mtblck/botling/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/mtblck/botling/releases/tag/v0.1.0
