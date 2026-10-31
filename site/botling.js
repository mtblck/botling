// The Botling playground. Imports botling straight from the package build (copied to /lib by
// scripts/site.mjs), so the page always shows what npm ships; site/playground.js does the rest.
import {
  botling,
  botlingDataUri,
  FRAMES,
  HOLIDAY_PALETTES,
  PALETTES,
  randomSeed,
  resolveTraits,
  SHAPES,
} from '/lib/styles/botling/index.js';
import { playground, sharedGroups } from '/playground.js';

const ACCESSORY_NAMES = { headphones: 'headphones', visor: 'a visor band', bow: 'a bow', cap: 'a cap' };

/** Names the big robot for screen readers, so a change of seed or option is heard. */
function describe(seed, options) {
  const t = resolveTraits(seed, options);
  const palette = typeof options.palette === 'object' ? options.palette : PALETTES[t.palette];
  const framing = options.frame ? [`in a ${options.frame} frame`] : [];
  const parts = [`${t.shape} cells`, ...framing, `${palette.name} palette`, `${t.head} head`, `${t.eyes} eyes`];
  if (t.mouth !== 'none') parts.push(`${t.mouth === 'o' ? 'O-shaped' : t.mouth} mouth`);
  // Matches slots() in the package: these accessories and an off-side antenna take the top piece's place.
  const isTopCovered = ['headphones', 'bow', 'cap'].includes(t.accessory) || t.quirk === 'antenna';
  if (t.top !== 'none' && !isTopCovered) parts.push(`${t.top} on top`);
  if (t.accessory !== 'none') parts.push(`wearing ${ACCESSORY_NAMES[t.accessory]}`);
  return `Robot for "${seed}": ${parts.join(', ')}`;
}

const shared = sharedGroups({ SHAPES, FRAMES });
playground({
  name: 'botling',
  noun: 'robot',
  draw: botling,
  dataUri: botlingDataUri,
  randomSeed,
  holidays: HOLIDAY_PALETTES,
  describe,
  swatch: (p) => [p.bg, p.body, p.glow, p.accent],
  groups: [
    shared.cells,
    shared.frame,
    {
      name: 'palette',
      legend: 'Palette',
      choices: [['auto', 'Seed picks'], ...PALETTES.map((p, i) => [String(i), p.name, p])],
    },
    {
      name: 'palette',
      legend: 'Holiday palette',
      choices: Object.entries(HOLIDAY_PALETTES).map(([key, p]) => [key, p.name, p]),
    },
    shared.grid,
    {
      name: 'motion',
      legend: 'Motion',
      choices: [
        ['off', 'Still'],
        ['on', 'Animated'],
      ],
    },
  ],
});
