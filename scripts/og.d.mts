export const WIDTH: number;
export const HEIGHT: number;
/** Draws the link preview card as a 1200x630 PNG, from the botling package passed in. */
export function ogImage(lib: typeof import('../src/index.js')): Buffer;
/** Draws a style page's link preview card as a 1200x630 PNG, from the style's module. */
export function styleOgImage(lib: Record<string, unknown>): Buffer;
