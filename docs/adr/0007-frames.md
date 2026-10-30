---
public: true
---

# 0007: Frame robots in named shapes, clipped by a shared clip path

- **Status:** Accepted
- **Date:** 2026-10-30
- **PR:** https://github.com/mtblck/botling/pull/TBD

## Context

People wanted round and rounded avatars. CSS `border-radius` on the image
already rounds one, but it slices the grid's edge cells in half, and it
does nothing where there is no CSS: a downloaded SVG, a PNG, an email.
Robots reach the corners of their square: about half have shoulders and
one in twenty has an antenna or ear outside the inscribed circle.

We weighed a numeric `radius` (0 square to 0.5 circle) against named
frames, and three ways to treat a circle: crop the robot, shrink it to 83%
so heads fit, or shrink it to 80% so everything fits. Side by side, Matt
saw no difference worth having between the two shrunk circles and chose
the crop.

## Decision

We add `frame: 'square' | 'rounded' | 'squircle' | 'circle'`, default
`'square'`, whose output is unchanged. `'rounded'` has corners a fifth of
the width; `'squircle'` is a four-curve squircle with the robot at a fixed
92%, the most every robot in the corpus needs to fit while hovering;
`'circle'` crops the robot at full size. The empty grid keeps only cells
wholly inside the frame, and fills the room a shrunk robot leaves.

Every frame but `'square'` clips to its outline with a `<clipPath>`. The id
names the frame, padding and span, so two clip paths with one id are always
identical and inlined robots can share them.

## Consequences

A circle can cut the tips of the widest antennas and ears; that's the look
Matt chose. Each frame's picture is frozen like the rest (ADR 0006): its
outline, scale and the grid cells it keeps change only in a major. A radius
number could still be added later as its own option. The shared id relies
on every copy being identical, so the geometry in an id must never change
without the id changing too.
