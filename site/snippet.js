// Pure helpers behind the playground's controls, kept apart from the DOM so
// test/site-snippet.test.ts can check that the copied code draws the same robot.

/**
 * Options for botling() from the playground state, leaving out anything on auto.
 *
 * @param {{ shape: string, palette: string, grid: string }} state - The playground's choices
 * @param {object} [extra] - Options to add, such as size
 * @returns {object} botling() options
 */
export function options(state, extra = {}) {
  const o = { ...extra };
  if (state.shape !== 'auto') o.shape = state.shape;
  if (state.palette !== 'auto') o.palette = Number(state.palette);
  if (state.grid !== 'auto') o.showGrid = state.grid === 'on';
  return o;
}

/**
 * The call a developer would write for the robot on screen.
 *
 * @param {{ seed: string, shape: string, palette: string, grid: string }} state - The playground's choices
 * @returns {string} A botling(...) call in single-quoted JavaScript
 */
export function snippet(state) {
  const args = Object.entries(options(state)).map(([k, v]) => `${k}: ${JSON.stringify(v).replaceAll('"', "'")}`);
  const seed = JSON.stringify(state.seed).replaceAll("'", "\\'").replace(/^"|"$/g, "'");
  return `botling(${seed}${args.length ? `, { ${args.join(', ')} }` : ''})`;
}
