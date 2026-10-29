// Types for snippet.js, so test/site.test.ts type-checks against the plain-JS site module.
import type { BotlingOptions, Palette } from '../src/index.js';

export interface PlaygroundState {
  seed: string;
  shape: string;
  palette: string;
  grid: string;
}
export function options(
  state: Omit<PlaygroundState, 'seed'>,
  extra?: BotlingOptions,
  holidays?: Readonly<Record<string, Palette>>,
): BotlingOptions;
export function snippet(state: PlaygroundState): string;
