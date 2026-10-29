# Changelog

All notable changes to this project are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/) with the output rule in the README:
any change to the robot a seed draws is a major version.

## [Unreleased]

### Added

- `botling(seed, options)` renders a seeded robot as an SVG string.
- `botlingDataUri(seed, options)` returns the same SVG as a `data:` URI.
- Square, circle and triangle cell grids.
- 12 palettes, 7 heads, 10 eyes, 8 mouths, 7 tops and 4 side pieces.
- `traits`, `grid`, `resolveTraits` and the part lists for building pickers.
- `showGrid: 'auto'` hides the empty grid below 40px.
- `HOLIDAY_PALETTES` (New Year's, Valentine's, St Patrick's, Fourth of July, Halloween, Christmas), and `palette` accepts a palette object as well as an index. Seeds never pick a holiday palette.
- `detail` option and `smallGrid()`: below 40px (`detail: 'auto'`), a simpler 9x9 robot from the same traits with touching cells, so 24px avatars stay readable.
- Requires Node 22 or newer (Node 20 reached end of life in April 2026).

The playground site (`site/`, not part of the npm package) lets you try seeds, shapes and palettes and copy the code.
