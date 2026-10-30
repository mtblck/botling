// Types for motion.js, so test/gif.test.ts type-checks against the plain-JS site module.
export function periods(svg: string): number[];
export function loopLength(list: number[]): number;
export function frameAt(svg: string, loop: number, t: number): string;
