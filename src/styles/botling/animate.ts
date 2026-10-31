import { createRng } from '../../core/random.js';
import { type Animation, clocks, type Motion, SMALL_MOTIONS, SPECS, type Variant } from '../../core/render/motion.js';
import { GRID_SIZE, type Part, SMALL_GRID_SIZE } from './grid/index.js';
import { Role, type Traits } from './types.js';

export type { Animation, Motion } from '../../core/render/motion.js';

/** Eyes drawn shut already; a blink would squash a line into a thinner line. */
const SHUT_EYES: readonly Traits['eyes'][] = ['sleepy'];

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
