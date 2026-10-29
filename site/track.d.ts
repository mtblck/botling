// Types for track.js, so test/site.test.ts type-checks against the plain-JS site module.
export const HOST: string;
export function arrival(referrer: string, host: string): { visit?: true; ref?: string };
export function body(event: string, extra?: Record<string, unknown>): string;
export function track(event: string, extra?: Record<string, unknown>): void;
