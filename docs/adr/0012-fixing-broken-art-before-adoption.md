---
public: true
---

# 0012: Broken art is fixed in a patch until someone depends on it

- **Status:** Accepted
- **Date:** 2026-10-31
- **PR:** [#77](https://github.com/mtblck/seedkin/pull/77)

## Context

ADR 0001 and ADR 0011 make any change to the avatar a seed draws a major
version, for every style, from 2.4.0. Within hours of 2.4.0, playground checks
turned up art that was plainly broken rather than a matter of taste:

- On about a quarter of Noggins an eye ran into the mouth, so talking or
  blinking pulled part of the face away.
- About a quarter of robots had a mouth drawn into an eye, so talking moved
  part of the eye.
- A Beastie's blink showed a body-coloured block behind its eye stalks.
- Soft looks drew hairline seams where three colours met.

Fixing these by the rules would have meant 3.0.0, 4.0.0 and so on in a single
day. Nobody depends on 2.x yet: BotCollector still uses `botling` 1.x, and no
other app is known to store a Seedkin seed.

## Decision

Until Matt says an app depends on Seedkin, we fix art that is broken in a
patch release, even when it changes the avatar a seed draws or which parts
move. Broken means parts that join or split when they shouldn't, stray shapes,
or seams; it does not cover taste. Each fix gets a CHANGELOG line that says
the still picture changes, and Matt approves the art before it merges.
Taste changes and new traits still follow ADR 0001 and ADR 0011.

2.4.1 (#73, #74) and 2.4.2 (#76) are the first fixes made this way. In 2.4.2,
every still Noggin changes: the mouth sits a row lower, narrow heads get a
five-cell chin, a wink sits level with the open eye, and `smirk` becomes a
small V. Animated markup of the other styles changes too, but their stills do not.

## Consequences

A seed stored on 2.4.0 can draw a different Noggin on `^2.4.0`. While nobody
stores seeds, that costs nothing. The grace period ends when Matt names a
dependent app (BotCollector adopting `seedkin` is the likely one). From then
on, ADR 0001 and ADR 0011 apply without exception, and a fix like these is a
major version.
