import type { Part } from '../canvas.js';
import { createRng, int, type Rng } from '../random.js';
import { Role } from '../types.js';

/**
 * Ways an avatar moves. Eyes blink, a top piece wobbles, side pieces twitch,
 * the mouth talks, a scanline sweeps a screen, and the whole avatar hovers.
 */
export type Motion = 'blink' | 'wobble' | 'twitch' | 'talk' | 'scan' | 'hover';
/** Every motion, in the order their timing is drawn from the seed. */
export const MOTIONS: readonly Motion[] = ['blink', 'wobble', 'twitch', 'talk', 'scan', 'hover'];
/** The only motions a small avatar gets: anything busier reads as flicker at 24px. */
export const SMALL_MOTIONS: readonly Motion[] = ['blink', 'hover'];

/** A motion, or a second take on one: a double blink, or a wobble mirrored for the right side. */
export type Variant = Motion | 'blink2' | 'wobbler';

/** How one variant moves. */
export interface Spec {
  /** Keyframes, the same in every avatar, so avatars inlined on one page share them. */
  keyframes: string;
  /** Period range in tenths of a second. */
  period: readonly [number, number];
  /** Declarations before `animation`, such as the transform origin. */
  rule?: string;
  timing?: string;
}

const ORIGIN = 'transform-box:fill-box;transform-origin:center;';
const BASE = 'transform-box:fill-box;transform-origin:50% 100%;';
/** Every variant's keyframes and timing. */
export const SPECS: Readonly<Record<Variant, Spec>> = {
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
  // A glowing copy of each screen row, hidden at rest, so the band shows on dark
  // screens too; faint, so it reads as a tint and not as more eyes.
  scan: { keyframes: '0%,16%,100%{opacity:0}4%,8%{opacity:.35}', period: [30, 50] },
  hover: { keyframes: '50%{transform:translateY(-.4px)}', period: [26, 40], timing: ' ease-in-out' },
};

/** One motion's seeded timing, in tenths of a second. */
export interface Clock {
  name: Variant;
  period: number;
  offset: number;
}

/**
 * Seeds each motion's period and start, drawing for every motion even where
 * an avatar doesn't use it, so it keeps its timing at every size.
 *
 * @param rng - A stream of its own, so timing never shifts the traits
 * @returns Each motion's clock
 */
export function clocks(rng: Rng): Record<Motion, Clock> {
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

/** The moving parts of one avatar: which class each cell goes in, and the style for them. */
export interface Animation {
  /** The class for a cell, or null for a still one. Cells with one class share a group. */
  classOf: (role: Role, part: Part, x: number) => string | null;
  /** Extra copies of a cell, each a group (`''` for the still one) and the role whose colour it takes. */
  copies: (role: Role, part: Part, x: number, y: number) => [string, Role][];
  /** Attributes for a group. */
  attrs: (cls: string) => string;
  /** The class for a group around the whole avatar, or null. */
  wrap: string | null;
  /** The `<style>` for the classes used. */
  css: (used: Iterable<string>) => string;
}

/** What moves in one avatar. */
export interface MotionPlan {
  /** The style's name, which prefixes every class and keyframe. */
  style: string;
  /** The style's salted seed. */
  seed: string;
  /** Size of the grid drawn, to tell the left side from the right. */
  size: number;
  isSmall: boolean;
  /** The motion for each tagged part; untagged and unlisted parts hold still. */
  moves: Partial<Record<Exclude<Part, null>, 'blink' | 'talk' | 'wobble' | 'twitch'>>;
  /** The colour shown behind blinking and talking cells as they squash. */
  lid: Role;
}

/**
 * Works out how an avatar moves, the way Botling's robots do. Timing is
 * written into each class name, so a class means the same rule in every
 * avatar and inlined avatars can't restyle each other. Everything sits inside
 * a `prefers-reduced-motion: no-preference` query.
 *
 * @param plan - The style, seed and moving parts
 * @returns Classes for cells and the style for them
 */
export function animation(plan: MotionPlan): Animation {
  const clock = clocks(createRng(`${plan.seed}\u0000animate`));
  const on = (m: Motion): boolean => !plan.isSmall || SMALL_MOTIONS.includes(m);
  const rules = new Map<string, string>();
  const cls = (m: Motion, lag = 0, as?: Variant): string => {
    const { period, offset } = clock[m];
    const name = as ?? clock[m].name;
    const start = (offset + lag) % period;
    const id = `${plan.style}-${name}-${period}-${start}`;
    const s = SPECS[name];
    const timing = `${period / 10}s ${-start / 10}s${s.timing ?? ''}`;
    rules.set(id, `.${id}{${s.rule ?? ''}animation:${plan.style}-${name} ${timing} infinite}`);
    return id;
  };
  const center = (plan.size - 1) / 2;
  const classOf = (role: Role, part: Part, x: number): string | null => {
    const m = part === null || role === Role.Empty ? undefined : plan.moves[part];
    if (!m || !on(m)) return null;
    const right = x > center;
    if (m === 'wobble') return cls('wobble', 0, right ? 'wobbler' : undefined);
    if (m === 'twitch') return cls('twitch', right ? 2 : 0);
    return cls(m);
  };
  const squashes = new RegExp(`^${plan.style}-(blink|talk)`);
  return {
    classOf,
    copies: (role, part, x) => (squashes.test(classOf(role, part, x) ?? '') ? [['', plan.lid]] : []),
    attrs: () => '',
    wrap: on('hover') ? cls('hover') : null,
    css: (used) => {
      const names = new Set<string>();
      let body = '';
      for (const id of used) {
        const name = id.slice(plan.style.length + 1).split('-')[0] as Variant;
        if (!names.has(name)) body += `@keyframes ${plan.style}-${name}{${SPECS[name].keyframes}}`;
        names.add(name);
        body += rules.get(id) ?? '';
      }
      return body ? `<style>@media (prefers-reduced-motion:no-preference){${body}}</style>` : '';
    },
  };
}
