import type { Part } from '../grid/index.js';
import { createRng, int } from '../random.js';
import { Role, type Traits } from '../types.js';

/** How a cell moves: eyes blink, a top piece's tip pulses, the screen flickers. */
export type Motion = 'blink' | 'pulse' | 'flicker';

/** Eyes drawn shut or squinting already; a blink would squash them flat. */
const SHUT_EYES: readonly Traits['eyes'][] = ['sleepy', 'happy'];

/**
 * Works out which cells move. Below 40px only the eyes blink: anything
 * busier reads as flicker at 24px.
 *
 * @param t - The robot's traits
 * @param isSmall - Drawing the small robot
 * @returns A function from a cell's role and part to its motion, or null for a still cell
 */
export function motionOf(t: Traits, isSmall: boolean): (role: Role, part: Part) => Motion | null {
  const blinks = !SHUT_EYES.includes(t.eyes);
  return (role, part) => {
    if (part === 'eyes') return blinks ? 'blink' : null;
    if (isSmall) return null;
    if (part === 'top' && role === Role.Accent) return 'pulse';
    if (t.hasScreen && (role === Role.Screen || role === Role.Glow)) return 'flicker';
    return null;
  };
}

/**
 * Keyframes, the same in every robot, so two robots inlined on one page can
 * share them. A blink takes 4% of its period, 120-280ms; the screen dips
 * twice in quick succession, held rather than faded.
 */
const KEYFRAMES: Record<Motion, string> = {
  blink: '0%,96%,100%{transform:none}98%{transform:scaleY(.1)}',
  pulse: '50%{opacity:.35}',
  flicker: '0%,92%,100%{opacity:1}93%{opacity:.75}94%{opacity:.95}95%{opacity:.85}',
};

/** Period and start offset ranges per motion, in tenths of a second. */
const PERIODS: Record<Motion, readonly [number, number]> = {
  blink: [30, 69],
  pulse: [18, 26],
  flicker: [80, 139],
};

const RULES: Record<Motion, string> = {
  blink: 'transform-box:fill-box;transform-origin:center;',
  pulse: '',
  flicker: '',
};
const TIMING: Record<Motion, string> = { blink: '', pulse: ' ease-in-out', flicker: ' step-end' };

const seconds = (tenths: number): string => `${tenths / 10}s`;

/**
 * Class names and the `<style>` that animates them. Timing comes from the
 * seed, so a page of robots doesn't blink in unison, and is written into the
 * class name: a class means the same rule in every robot, so inlined robots
 * can't restyle each other. Everything sits inside a
 * `prefers-reduced-motion: no-preference` query, so the robot holds still
 * for anyone who asked for less motion.
 *
 * @param seed - The robot's seed
 * @param used - Motions the robot has cells for
 * @returns A class name per motion, and the style element
 */
export function motionStyle(seed: string, used: readonly Motion[]): { classes: Record<Motion, string>; css: string } {
  // A stream of its own, so timing never shifts the traits' draws.
  const rng = createRng(`${String(seed)}\u0000animate`);
  const classes = {} as Record<Motion, string>;
  let rules = '';
  for (const motion of ['blink', 'pulse', 'flicker'] as const) {
    const [lo, hi] = PERIODS[motion];
    const period = int(rng, lo, hi);
    const offset = int(rng, 0, period - 1);
    if (!used.includes(motion)) continue;
    const name = `botling-${motion}-${period}-${offset}`;
    classes[motion] = name;
    rules +=
      `@keyframes botling-${motion}{${KEYFRAMES[motion]}}` +
      `.${name}{${RULES[motion]}animation:botling-${motion} ${seconds(period)} ${seconds(-offset)}${TIMING[motion]} infinite}`;
  }
  return { classes, css: rules ? `<style>@media (prefers-reduced-motion:no-preference){${rules}}</style>` : '' };
}
