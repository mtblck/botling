---
public: true
---

# 0008: PNG, JPG and GIF downloads live in the playground, and GIFs fit one loop

- **Status:** Accepted
- **Date:** 2026-10-30
- **PR:** (this PR)

## Context

People wanted the robot as a PNG, JPG or GIF, with the GIF moving when
Motion is on. Turning SVG into pixels needs a canvas (a browser) or an
image library (a dependency), and the package promises zero dependencies
and a string out. An animated robot's motions each run on their own seeded
period (1.8 to 5 seconds, ADR 0003), so their true common loop can run to
minutes, but a GIF has to loop, and a seam would show as a jump.

## Decision

Raster downloads are a playground feature, not package API. The page draws
the SVG into a canvas through a `data:` URI `<img>` (the CSP allows `data:`
images, not `blob:`), and a small GIF encoder of our own (`site/gif.js`,
256-colour palette from the commonest colours, LZW, only the changed
rectangle per frame) writes the file. Its code loads on the first raster
download.

The GIF picks a loop between 6 and 10 seconds that changes the robot's
periods least, and fits each period to divide it a whole number of times,
so the file loops without a seam. Frames are 20 a second (a blink lasts
80 ms or more) and drawn by pausing every CSS animation at its point in the
loop (`site/motion.js`), which also drops the reduced-motion query, since
asking for an animated GIF is asking for motion.

## Consequences

- The package and every seed's SVG are unchanged.
- A GIF's motion runs up to about 20% faster or slower than the live robot.
- `site/motion.js` reads the `animation:` rules the package writes. A change
  to that markup (allowed in a minor, ADR 0006) must keep
  `test/gif.test.ts` passing.
- An animated GIF is about 0.5 to 1.2 MB at 256px and takes a second or two
  to make; encoding blocks the page for under a second.
