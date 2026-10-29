// Pure helpers behind the playground's controls, kept apart from the DOM so
// test/site.test.ts can check that the copied code draws the same robot. A palette is
// either a PALETTES index ('0'-'11') or a HOLIDAY_PALETTES key ('halloween').

/**
 * Options for botling() from the playground state, leaving out anything on auto.
 *
 * @param {{ shape: string, palette: string, grid: string, motion?: string }} state - The playground's choices
 * @param {object} [extra] - Options to add, such as size
 * @param {Record<string, object>} [holidays] - HOLIDAY_PALETTES, to look holiday keys up in
 * @returns {object} botling() options
 */
export function options(state, extra = {}, holidays = {}) {
  const o = { ...extra };
  if (state.shape !== 'auto') o.shape = state.shape;
  if (isHoliday(state.palette)) {
    if (holidays[state.palette]) o.palette = holidays[state.palette];
  } else if (state.palette !== 'auto') o.palette = Number(state.palette);
  if (state.grid !== 'auto') o.showGrid = state.grid === 'on';
  if (state.motion === 'on') o.animate = true;
  return o;
}

/**
 * The call a developer would write for the robot on screen.
 *
 * @param {{ seed: string, shape: string, palette: string, grid: string, motion?: string }} state - The playground's choices
 * @returns {string} A botling(...) call in single-quoted JavaScript
 */
export function snippet(state) {
  const args = Object.entries(options(state)).map(([k, v]) => `${k}: ${JSON.stringify(v).replaceAll('"', "'")}`);
  // The object would print as a wall of hex; name it the way a developer would.
  if (isHoliday(state.palette))
    args.splice(state.shape === 'auto' ? 0 : 1, 0, `palette: HOLIDAY_PALETTES.${state.palette}`);
  const seed = JSON.stringify(state.seed).replaceAll("'", "\\'").replace(/^"|"$/g, "'");
  return `botling(${seed}${args.length ? `, { ${args.join(', ')} }` : ''})`;
}

/** Holiday keys are names; built-in palettes are numbers. */
const isHoliday = (palette) => palette !== 'auto' && !/^\d+$/.test(palette);
