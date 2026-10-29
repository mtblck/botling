---
public: true
---

# 0004: Every robot moves, with lids and glowing overlays

- **Status:** Accepted
- **Date:** 2026-10-29
- **PR:** https://github.com/mtblck/botling/pull/29

## Context

The first `animate` (ADR 0003) blinked the eyes, pulsed the top piece's tip
and flickered the screen. In use, many robots barely moved: a robot with no
screen and no top piece only blinked, and its eyes are dark holes in the body,
so squashing them showed the dark background behind and the blink was
invisible. Dimming the screen didn't show on dark screens either. Blinks came
every 3 to 7 seconds, which read as nothing happening. Matt picked from a
side-by-side page of eight robots under each candidate motion.

## Decision

Animated robots hover, blink (about a third blink twice), wobble the top piece,
twitch ears, handles and bolts, talk, and sweep a scanline down the screen.
Below 40px they only blink and hover. Pulse and flicker are dropped. A blinking
eye or talking mouth gets a still copy beneath it in the face colour (screen,
or body without a screen), so a squash always uncovers a lid. The scanline is a
glowing copy of each screen row, hidden at rest (`opacity="0"`), that fades in
row by row, so it brightens dark screens instead of dimming them. The robot
draws the grid outside its hover group, so the grid stays put.

On the tallest heads the antenna's stalk is one cell shorter so its tip never
sits on the top row: with hover and wobble it touched the tile's edge. That
changes the still robot for about 6% of seeds, a deliberate art change in
0.2.0 (0.x allows it; from 1.0 it would be a major, per ADR 0001).

## Consequences

- Every robot moves at every size: hover needs nothing but a body.
- Animated robots grow by about 2.4 KB at full size (up to 4.5 KB with a large
  screen, mostly the scanline copies) and half a kilobyte below 40px.
- Still frames still match the robot drawn without `animate`, cell for cell;
  a test walks the paths in paint order to check it.
- Default output changes only for the antenna seeds above.
