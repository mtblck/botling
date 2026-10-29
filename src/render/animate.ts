import { GRID_SIZE, type Part, SMALL_GRID_SIZE } from '../grid/index.js';
import { createRng, int, type Rng } from '../random.js';
import { Role, type Traits } from '../types.js';

/**
 * Ways a robot moves. Eyes blink, the top piece wobbles, ears and handles
 * twitch, the mouth talks, a scanline sweeps the screen, and the whole robot
 * hovers over its background.
 */
export type Motion = 'blink' | 'wobble' | 'twitch' | 'talk' | 'scan' | 'hover';
/** Every motion, in the order their timing is drawn from the seed. */
const MOTIONS: readonly Motion[] = ['blink', 'wobble', 'twitch', 'talk', 'scan', 'hover'];
/** The only motions the small robot gets: anything busier reads as flicker at 24px. */
const SMALL_MOTIONS: readonly Motion[] = ['blink', 'hover'];

/** Eyes drawn shut already; a blink would squash a line into a thinner line. */
const SHUT_EYES: readonly Traits['eyes'][] = ['sleepy'];

interface Spec {
  /** Keyframes, the same in every robot, so robots inlined on one page share them. */
  keyframes: string;
  /** Period range in tenths of a second. */
  period: readonly [number, number];
  /** Declarations before `animation`, such as the transform origin. */
  rule?: string;
  timing?: string;
}
/** A motion, or a second take on one: a double blink, or a wobble mirrored for the right side. */
type Variant = Motion | 'blink2' | 'wobbler';
const ORIGIN = 'transform-box:fill-box;transform-origin:center;';
const BASE = 'transform-box:fill-box;transform-origin:50% 100%;';
const SPECS: Record<Variant, Spec> = {
  blink: { keyframes: '0%,96%,100%{transform:none}98%{transform:scaleY(.1)}', period: [20, 45], rule: ORIGIN },
  blink2: {
    keyframes: '0%,90%,94%,100%{transform:none}92%,97%{transform:scaleY(.1)}',
    period: [20, 45],
    rule: ORIGIN,
  },
  wobble: {
    keyframes:
      '0%,50%,100%{transform:none}12%{transform:rotate(-18deg)}28%{transform:rotate(13deg)}40%{transform:rotate(-5deg)}',
    period: [28, 40],
    rule: BASE,
    timing: ' ease-in-out',
  },
  wobbler: {
    keyframes:
      '0%,50%,100%{transform:none}12%{transform:rotate(18deg)}28%{transform:rotate(-13deg)}40%{transform:rotate(5deg)}',
    period: [28, 40],
    rule: BASE,
    timing: ' ease-in-out',
  },
  twitch: {
    keyframes: '0%,88%,93%,100%{transform:none}90%,96%{transform:translateY(-.35px)}',
    period: [18, 32],
  },
  talk: {
    keyframes: '0%,55%,65%,75%,100%{transform:none}60%,70%,80%{transform:scaleY(.35)}',
    period: [30, 50],
    rule: ORIGIN,
  },
  // A glowing copy of each screen row, hidden at rest, so the band shows on dark screens too.
  scan: { keyframes: '0%,16%,100%{opacity:0}4%,8%{opacity:.8}', period: [30, 50] },
  hover: { keyframes: '50%{transform:translateY(-.4px)}', period: [26, 40], timing: ' ease-in-out' },
};

/** One motion's seeded timing, in tenths of a second. */
interface Clock {
  name: Variant;
  period: number;
  offset: number;
}

/** The moving parts of one robot: which class each cell goes in, and the style for them. */
export interface Animation {
  /** The class for a cell, or null for a still one. Cells with one class share a group. */
  classOf: (role: Role, part: Part, x: number) => string | null;
  /**
   * Extra copies of a cell: a lid under a blinking eye or a talking mouth, in
   * the colour around it, so the squash shows on a robot without a screen;
   * and a hidden glowing copy of a screen cell for the scanline. Each is a
   * group (`''` for the still one) and the role whose colour it takes.
   */
  copies: (role: Role, part: Part, x: number, y: number) => [string, Role][];
  /** Attributes for a group: scanline copies start hidden. */
  attrs: (cls: string) => string;
  /** The class for a group around the whole robot, or null. */
  wrap: string | null;
  /** The `<style>` for the classes used. */
  css: (used: Iterable<string>) => string;
}

/**
 * Seeds each motion's period and start, drawing for every motion even where
 * a robot doesn't use it, so a robot keeps its timing at every size.
 */
function clocks(rng: Rng): Record<Motion, Clock> {
  const out = {} as Record<Motion, Clock>;
  for (const motion of MOTIONS) {
    const [lo, hi] = SPECS[motion].period;
    const period = int(rng, lo, hi);
    const offset = int(rng, 0, period - 1);
    const twice = rng() < 0.35;
    out[motion] = { name: motion === 'blink' && twice ? 'blink2' : motion, period, offset };
  }
  return out;
}

/**
 * Works out how a robot moves. Timing comes from the seed, on a stream of its
 * own so it never shifts the traits, and is written into each class name: a
 * class means the same rule in every robot, so inlined robots can't restyle
 * each other. Everything sits inside a `prefers-reduced-motion:
 * no-preference` query, so the robot holds still for anyone who asked for
 * less motion.
 *
 * @param seed - The robot's seed
 * @param t - The robot's traits
 * @param isSmall - Drawing the small robot, which only blinks and hovers
 * @returns Classes for cells and the style for them
 */
export function animation(seed: string, t: Traits, isSmall: boolean): Animation {
  const clock = clocks(createRng(`${String(seed)}\u0000animate`));
  const on = (m: Motion): boolean => !isSmall || SMALL_MOTIONS.includes(m);
  const rules = new Map<string, string>();
  /** A class for a motion, `lag` tenths behind its clock, optionally as another variant. */
  const cls = (m: Motion, lag = 0, as?: Variant): string => {
    const { period, offset } = clock[m];
    const name = as ?? clock[m].name;
    const start = (offset + lag) % period;
    const id = `botling-${name}-${period}-${start}`;
    const s = SPECS[name];
    rules.set(
      id,
      `.${id}{${s.rule ?? ''}animation:botling-${name} ${period / 10}s ${-start / 10}s${s.timing ?? ''} infinite}`,
    );
    return id;
  };
  const blinks = !SHUT_EYES.includes(t.eyes);
  const center = ((isSmall ? SMALL_GRID_SIZE : GRID_SIZE) - 1) / 2;
  const classOf = (role: Role, part: Part, x: number): string | null => {
    if (role === Role.Empty) return null;
    if (part === 'eyes') return blinks && on('blink') ? cls('blink') : null;
    // Each side's piece moves on its own, the right one mirroring the left.
    const side = Math.sign(x - center);
    if (part === 'top' && on('wobble')) return cls('wobble', 0, side > 0 ? 'wobbler' : undefined);
    if (part === 'sides' && on('twitch')) return cls('twitch', side > 0 ? 2 : 0);
    if (part === 'mouth' && role === Role.Glow && on('talk')) return cls('talk');
    return null;
  };
  const copies = (role: Role, part: Part, x: number, y: number): [string, Role][] => {
    const out: [string, Role][] = [];
    const moving = classOf(role, part, x) ?? '';
    if (/^botling-(blink|talk)/.test(moving)) out.push(['', t.hasScreen ? Role.Screen : Role.Body]);
    if (t.hasScreen && role === Role.Screen && on('scan')) out.push([cls('scan', clock.scan.period - y), Role.Glow]);
    return out;
  };
  return {
    classOf,
    copies,
    attrs: (id) => (id.startsWith('botling-scan') ? ' opacity="0"' : ''),
    wrap: on('hover') ? cls('hover') : null,
    css: (used) => {
      const names = new Set<string>();
      let body = '';
      for (const id of used) {
        const name = id.split('-')[1] as Variant;
        if (!names.has(name)) body += `@keyframes botling-${name}{${SPECS[name].keyframes}}`;
        names.add(name);
        body += rules.get(id) ?? '';
      }
      return body ? `<style>@media (prefers-reduced-motion:no-preference){${body}}</style>` : '';
    },
  };
}
