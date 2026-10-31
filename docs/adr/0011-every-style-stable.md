---
public: true
---

# 0011: Snoot, Noggin and Beastie are Stable, and every style can animate

- **Status:** Accepted
- **Date:** 2026-10-31
- **PR:** [#71](https://github.com/mtblck/seedkin/pull/71)

## Context

ADR 0009 shipped new styles as Preview, where a seed's picture may change in a
minor, until Matt freezes them. Snoot (2.1.0), Noggin and Beastie (2.2.0)
shipped that way. Two gaps were left before freezing them: only Botling took
`animate`, and Snoot repeated itself. Over 5,000 seeds, 7.5% of full-size
Snoots and 20% of 24px Snoots drew exactly the same picture as another seed,
mostly because its eight coats and few traits ran out. Freezing would have
fixed those repeats forever.

## Decision

We mark Snoot, Noggin and Beastie Stable in 2.4.0: each style now follows
Botling's rules (ADR 0001, ADR 0006), so a change to the avatar a seed draws
is a major version. A golden corpus (`test/family-corpus.test.ts`) pins each
style's traits, grids, colours and markup over 500 seeds, as
`test/corpus.test.ts` does for Botling.

Before freezing, Snoot gains four coats, a mouth (smile, tongue or open), likelier
markings, extras and cheeks, and more distinct small faces. That cuts repeats
to 1.4% at full size and 5.7% at 24px, and changes most Snoots, which Preview
allowed.

Every style takes `animate`. Botling's motion engine moves to
`src/core/render/motion.ts`, and each style tags the cells that move (eyes,
mouth, top, sides) and says which move each part makes: Snoots blink and
twitch their ears, Noggins blink and talk, Beasties blink, talk, wobble and
twitch. As with Botling (ADR 0003, ADR 0004), the motion is CSS inside the
SVG, still under reduced motion, and the frame at rest is the still avatar.
Below 40px every style only blinks and hovers. Botling's output does not change.

## Consequences

Apps can store a Snoot, Noggin or Beastie seed and get the same avatar back
through 2.x. Which parts move is part of the picture, so moving another part
is a major; timing stays a minor, as for Botling. A new style still starts in
Preview under ADR 0009, and needs its own corpus entry when it graduates.
