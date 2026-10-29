---
public: true
---

# 0002: Draw each colour as one path

- **Status:** Accepted
- **Date:** 2026-10-29
- **PR:** https://github.com/mtblck/botling/pull/22

## Context

A 96px robot with the grid shown was 9-14 KB of SVG, one element per cell
grouped by colour (#5): heavy for a page of 50 comment avatars. The output
string isn't the API, the picture is (ADR 0001), so any smaller encoding of the
same shapes is fair game. Options: whole-number coordinates under a
`transform` (about 15% off), `<defs>` + `<use>` per cell shape (ids clash when
several robots are inlined on one page), or one `<path>` per colour.

## Decision

We draw each colour as one `<path>` with relative path data, numbers to three
decimals without leading zeros. Polygons (triangles, diamonds, solid squares)
are filled. A gapped square is its inner 0.64 square, filled and stroked 0.24
wide with round joins, which is exactly the 0.88 square with 0.12 corners. A
circle is a zero-length `h0` with a round cap as wide as the circle. Shared
stroke attributes sit on one `<g>`.

## Consequences

- Output is 50-80% smaller (96px: square 14.4 to 4.6 KB, circle 8.6 to 1.9,
  triangle 11.6 to 5.6, diamond 13.3 to 7.0, on average). A size budget test
  holds it there.
- Same picture: rendered in Chromium and resvg against the old output, the
  shapes match; the only pixel changes are anti-aliasing where same-coloured
  cells meet, and the faint seams between solid cells on the small robot are
  gone because each colour is now one shape.
- The output relies on round caps on zero-length subpaths and round joins.
  Chromium and resvg were checked and draw both, as the SVG spec requires; a renderer that drops zero-length
  subpaths would lose circle cells. Revisit if one turns up in real use.
- A colour with alpha that is both filled and stroked (gapped squares) moves
  its alpha to `opacity`, so the stroke over the fill doesn't darken it.
- Snapshot tests pin the string, so they change with this; a future change
  that alters the snapshots must show the picture is the same, or be a major.
