---
public: true
---

# 0003: Animate with CSS inside the SVG, opt-in

- **Status:** Accepted; the set of motions is superseded by [0004](0004-every-robot-moves.md)
- **Date:** 2026-10-29
- **PR:** https://github.com/mtblck/botling/pull/28

## Context

People asked for a robot that comes alive: blinks, a pulsing antenna (#25).
The output has to stay a self-contained string with no script, work as an
`<img>` or `data:` URI, leave every existing seed's SVG alone (ADR 0001), and
respect people who've turned motion off. Options: SMIL `<animate>` (works in
`<img>`, but can't see `prefers-reduced-motion`), a script (blocked in
`<img>`, and a dependency on the host page), or a CSS `<style>` inside the SVG
(works in `<img>`, can sit in a reduced-motion media query, but an inlined
SVG's styles are global to the page and blocked by a strict `style-src`).

## Decision

We add `animate: true`, off by default, which puts one `<style>` in the SVG,
inside `@media (prefers-reduced-motion: no-preference)`. Cells that move are
tagged while the grid is drawn (eyes; a top piece's accent tip) and drawn in
their own paths, one `<g class>` per motion, so a blink can scale the eyes.
The full robot blinks, pulses and flickers its screen; below 40px it only
blinks. Timing is seeded from its own stream, never the traits stream, and
written into the class name (`botling-blink-47-12`), so a class means the
same rule in every robot and robots inlined on one page can't restyle each
other. Keyframes are identical in every robot for the same reason.

## Consequences

- Default output is byte-for-byte unchanged, and the snapshot tests say so.
  Animated, the still frame draws the same cells in the same colours; the only
  pixel changes are anti-aliasing where a moving path meets a still one.
- Animated robots are about 700 bytes larger and keep their image repainting:
  fine for a handful, not a page of 50.
- Under `style-src 'self'` an inlined animated robot is drawn still, because
  its `<style>` is blocked. The playground shows animated robots as `<img>`.
- Which eyes blink is art: a wink blinks only its open eye, an angry brow stays
  put, sleepy and happy eyes don't blink. Changing that, or the timing, changes
  animated output and counts like any other art change under ADR 0001.
