import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { options, type PlaygroundState, snippet } from '../site/snippet.js';
import { botling, HOLIDAY_PALETTES } from '../src/index.js';

const auto = { shape: 'auto', palette: 'auto', grid: 'auto' };

/** Runs a copied snippet the way a developer would paste it. */
const run = (code: string): string =>
  new Function('botling', 'HOLIDAY_PALETTES', `return ${code}`)(botling, HOLIDAY_PALETTES);

describe('playground snippet', () => {
  it('leaves out options on auto', () => {
    expect(snippet({ seed: 'abc', ...auto })).toBe("botling('abc')");
    expect(options(auto, { size: 24 })).toEqual({ size: 24 });
  });

  it.each(['', "it's", 'a"b', 'back\\slash\\', "'\\'", 'line\nbreak', 'sep arator', 'emoji 🤖', '+&=#%'])(
    'copies code that draws the robot on screen for %j',
    (seed) => {
      const state: PlaygroundState = { seed, shape: 'triangle', palette: '3', grid: 'off' };
      expect(run(snippet(state))).toBe(botling(seed, options(state)));
    },
  );
});

describe('playground holiday palettes', () => {
  it.each(Object.keys(HOLIDAY_PALETTES))('copies code for %s that draws the robot on screen', (holiday) => {
    for (const shape of ['auto', 'circle']) {
      const state: PlaygroundState = { seed: 'mtblck', shape, palette: holiday, grid: 'auto' };
      const code = snippet(state);
      expect(code).toContain(`palette: HOLIDAY_PALETTES.${holiday}`);
      expect(run(code)).toBe(botling('mtblck', options(state, {}, HOLIDAY_PALETTES)));
    }
  });

  it('leaves an unknown holiday out rather than passing undefined', () => {
    expect(options({ shape: 'auto', palette: 'arbor-day', grid: 'auto' }, {}, HOLIDAY_PALETTES)).toEqual({});
  });
});

describe('hosting:check', () => {
  const check = (dir: string) => spawnSync(process.execPath, ['scripts/check-hosting.mjs', dir], { encoding: 'utf8' });

  it('passes on the repo', () => {
    expect(check('.').status).toBe(0);
  });

  it('fails on inline scripts, handlers, style attributes and unsafe-inline', () => {
    const result = check('test/fixtures/bad-hosting');
    expect(result.status).toBe(1);
    for (const problem of [
      'unsafe-inline',
      'inline script',
      'inline event handler',
      'style attribute in site/app.js',
    ]) {
      expect(result.stderr).toContain(problem);
    }
  });
});
