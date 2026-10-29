---
order: 1
public: true
---

# botling

Seeded robot avatars as SVG, for any app that wants a friendly default picture
without storing one. MIT licensed, published to npm as `botling`.

## Why it exists

BotCollector needed a default avatar for the many profiles with no photo
(2 of 21 had one in October 2026). Existing generators either had a narrow
range (DiceBear's Pixelbot), a style Matt didn't want (Voxel Bot), licence
strings attached (CC BY sets) or privacy costs (Gravatar sends every viewer's
IP and is keyed by a guessable email hash). botling renders locally, has no
dependencies and is MIT, art included.

## What it does

- `botling(seed, options)` returns an SVG string; `botlingDataUri()` the same
  as a `data:` URI. Same seed, same robot.
- Square, circle or triangle cells; 12 palettes; 7 heads, 10 eyes, 8 mouths,
  7 tops, 4 side pieces.
- Below 40px it draws a simpler 9x9 robot from the same traits, so 24px
  avatars stay readable.
- `traits`, `grid`, `smallGrid`, `PALETTES` and the parts lists are exported
  for pickers.

## Where it's going

- First npm release (#6), then BotCollector profiles use it as the default
  avatar with a picker (mtblck/botcollector#331).
- More range (#4), parts designed for each cell shape (#3), smaller SVGs (#5).
- The playground site (#7) on its own domain.
