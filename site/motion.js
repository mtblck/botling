// Still frames of an animated avatar, for the GIF export. The package animates with CSS
// inside the SVG (ADR 0003): each moving group gets a rule like
// `animation:snoot-blink 3.4s -1.2s infinite`, every motion on its own seeded period.
// A GIF has to loop, so each period is nudged to divide one loop, and each frame pauses
// every animation at its point in that loop.

const RULE = /animation:([a-z]+-[a-z0-9]+) ([\d.]+)s (-?[\d.]+)s([^;}]*?) infinite/g;
const REDUCED = /<style>@media \(prefers-reduced-motion:no-preference\)\{(.*)\}<\/style>/s;

/**
 * The period of every animation in an SVG.
 *
 * @param {string} svg - An animated avatar from any style
 * @returns {number[]} Periods in seconds; empty for a still robot
 */
export function periods(svg) {
  return [...svg.matchAll(RULE)].map((m) => Number(m[2]));
}

/** A period stretched or squeezed to divide the loop a whole number of times. */
const fitted = (period, loop) => loop / Math.max(1, Math.round(loop / period));

/**
 * The loop length, between 6 and 10 seconds, that changes the robot's periods least.
 *
 * @param {number[]} list - Periods in seconds, from periods()
 * @returns {number} Seconds, in tenths; 0 when nothing moves
 */
export function loopLength(list) {
  if (!list.length) return 0;
  let best = 0;
  let bestCost = Infinity;
  for (let tenths = 60; tenths <= 100; tenths++) {
    const loop = tenths / 10;
    const cost = Math.max(...list.map((p) => Math.abs(fitted(p, loop) / p - 1)));
    if (cost < bestCost - 1e-9) [best, bestCost] = [loop, cost];
  }
  return best;
}

/**
 * The robot paused `t` seconds into a loop of `loop` seconds. It ignores
 * prefers-reduced-motion, since asking for an animated GIF is asking for motion.
 *
 * @param {string} svg - An animated avatar from any style
 * @param {number} loop - Seconds, from loopLength()
 * @param {number} t - Seconds into the loop
 * @returns {string} An SVG that draws that one frame
 */
export function frameAt(svg, loop, t) {
  return svg.replace(REDUCED, '<style>$1</style>').replace(RULE, (_, name, period, delay, timing) => {
    const p = fitted(Number(period), loop);
    const phase = ((-Number(delay) / Number(period)) * p + t) % p;
    return `animation:${name} ${p}s ${-phase.toFixed(4)}s${timing} infinite paused`;
  });
}
