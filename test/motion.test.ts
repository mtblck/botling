import { describe, expect, it } from 'vitest';
import { beastie, traits as beastieTraits } from '../src/styles/beastie/index.js';
import { noggin, traits as nogginTraits } from '../src/styles/noggin/index.js';
import { snoot, traits as snootTraits } from '../src/styles/snoot/index.js';
import { stillFrame } from './still-frame.js';

type Draw = (seed: string, opts?: { size?: number; animate?: boolean; look?: 'gapped' | 'inked' }) => string;
const STYLES: [string, Draw][] = [
  ['snoot', snoot as Draw],
  ['noggin', noggin as Draw],
  ['beastie', beastie as Draw],
];
const seeds = Array.from({ length: 60 }, (_, i) => `m-${i}`);
const classes = (svg: string): string[] => [...svg.matchAll(/<g class="([^"]+)"/g)].map(([, c]) => c as string);
const find = <T>(traits: (s: string) => T, ok: (t: T) => boolean): string => {
  for (let i = 0; ; i++) if (ok(traits(`f-${i}`))) return `f-${i}`;
};

describe.each(STYLES)('%s animate', (name, draw) => {
  it('leaves the default output alone', () => {
    for (const s of seeds.slice(0, 20)) {
      expect(draw(s, { animate: false })).toBe(draw(s));
      expect(draw(s)).not.toContain('<style');
    }
  });

  it('draws the still picture at rest, at both sizes and in an outlined look', () => {
    for (const s of seeds)
      for (const opts of [{ size: 96 }, { size: 24 }, { size: 96, look: 'inked' as const }])
        expect(stillFrame(draw(s, { ...opts, animate: true }))).toEqual(stillFrame(draw(s, opts)));
  });

  it('moves only for people who allow motion, with classes of its own', () => {
    const svg = draw('ada', { animate: true });
    expect(svg).toContain('<style>@media (prefers-reduced-motion:no-preference){');
    expect(classes(svg).length).toBeGreaterThan(0);
    for (const c of classes(svg))
      expect(c).toMatch(new RegExp(`^${name}-(blink2?|talk|wobbler?|twitch|hover)-\\d+-\\d+$`));
    expect(draw('ada', { animate: true })).toBe(svg);
  });

  it('only blinks and hovers when small', () => {
    for (const s of seeds)
      for (const c of classes(draw(s, { size: 24, animate: true }))) expect(c).toMatch(/-(blink2?|hover)-/);
  });

  it('rejects an animate that is not a boolean', () => {
    expect(() => draw('x', { animate: 'yes' as never })).toThrow(new RegExp(`^${name}: animate must be true or false`));
  });
});

describe('what each style moves', () => {
  const moves = (svg: string): Set<string> => new Set(classes(svg).map((c) => c.split('-')[1] as string));

  it('a Snoot blinks and twitches its ears, but not with sleepy eyes', () => {
    const cat = find(snootTraits, (t) => t.species === 'cat' && t.eyes === 'dot');
    const m = moves(snoot(cat, { animate: true }));
    expect(m.has('twitch') && m.has('hover')).toBe(true);
    expect([...m].some((x) => x.startsWith('blink'))).toBe(true);
    const sleepy = find(snootTraits, (t) => t.eyes === 'sleepy');
    expect([...moves(snoot(sleepy, { animate: true }))].some((m) => m.startsWith('blink'))).toBe(false);
  });

  it('a Noggin talks unless bearded, and blinks unless its eyes are shut or shaded', () => {
    const talker = find(nogginTraits, (t) => t.facial !== 'beard' && t.eyes === 'dot' && t.eyewear === 'none');
    const m = moves(noggin(talker, { animate: true }));
    expect(m.has('talk')).toBe(true);
    expect([...m].some((x) => x.startsWith('blink'))).toBe(true);
    expect(
      moves(
        noggin(
          find(nogginTraits, (t) => t.facial === 'beard'),
          { animate: true },
        ),
      ).has('talk'),
    ).toBe(false);
    const shut = find(nogginTraits, (t) => t.eyes === 'closed');
    expect([...moves(noggin(shut, { animate: true }))].some((x) => x.startsWith('blink'))).toBe(false);
  });

  it('a Beastie blinks, talks, wobbles its top and twitches its sides', () => {
    const b = find(beastieTraits, (t) => t.top === 'antennae' && t.sides === 'wings' && t.eyes === 'two');
    const m = moves(beastie(b, { animate: true }));
    for (const x of ['talk', 'twitch', 'hover']) expect(m.has(x)).toBe(true);
    expect(m.has('wobble') && m.has('wobbler')).toBe(true);
  });
});
