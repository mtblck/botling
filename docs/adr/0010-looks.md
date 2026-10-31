---
public: true
---

# 0010: Draw cells in named looks, gapped by default

- **Status:** Accepted
- **Date:** 2026-10-31
- **PR:** see the PR that adds `look`

## Context

Every style drew its cells apart, over a faint grid, which reads as pixel
art on a display. Matt asked whether closing the gap would give a flat,
cel-shaded or vector look, as an addition, not a replacement. The small
9x9 avatars already drew touching cells, so the core had solid outlines for
every cell shape.

A lab page drew all four styles six ways: gapped, flat, inked (a dark
outline plus lines between colours), soft (each run of one colour rounded
at its outer corners and filleted inside), soft-inked and sticker (a white
border and a shadow). Matt chose to ship all six.

## Decision

We add `look: 'gapped' | 'flat' | 'inked' | 'soft' | 'soft-inked' |
'sticker'` to every style, default `'gapped'`, whose output is unchanged.
The drawing lives in `src/core/render/look.ts` and `ink.ts`, shared by
`stillSvg` and Botling's animated renderer. Gapless looks never draw the
grid. Rounded corners and inner lines need square cells; on other shapes
`'soft'` falls back to flat cells. Ink is the palette's shade at 38%
brightness, so custom palettes get it too. Soft cells use arcs in the path
data, written by `pathData` from a radius on a point. Animated, each moving
group carries its own outline, so the outline moves with it.

## Consequences

A seed's picture stays the same in every look; only the drawing differs,
so seeds and stored choices carry over. Each look is frozen like the rest
(ADR 0001, 0006): its geometry, ink, border and scale change only in a
major, and snapshots in `test/look.test.ts` guard it. Soft shapes reach a
hundredth of a cell under their neighbours so anti-aliasing leaves no seams,
and a diagonal run of one colour stays joined at its corners rather than
breaking into beads. A new look is a minor; making one look the default
would be a major.
