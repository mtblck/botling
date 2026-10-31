// The Beastie playground, drawn from the package build at /lib; site/playground.js does the rest.
import {
  beastie,
  beastieDataUri,
  FRAMES,
  PALETTES,
  randomSeed,
  resolveTraits,
  SHAPES,
} from '/lib/styles/beastie/index.js';
import { playground, sharedGroups } from '/playground.js';

const EYES = { one: 'one eye', two: 'two eyes', three: 'three eyes', stalks: 'eyes on stalks', tiny: 'tiny eyes' };

/** Names the big Beastie for screen readers, so a change of seed or option is heard. */
function describe(seed, options) {
  const t = resolveTraits(seed, options);
  const parts = [
    `${t.shape} cells`,
    `${PALETTES[t.palette].name} hide`,
    EYES[t.eyes],
    `a ${t.mouth === 'o' ? 'round' : t.mouth} mouth`,
  ];
  if (t.top !== 'none') parts.push(t.top);
  if (t.sides !== 'none') parts.push(t.sides);
  if (t.hasSpots) parts.push('spots');
  return `Beastie for "${seed}": a ${t.body} body, ${parts.join(', ')}`;
}

const shared = sharedGroups({ SHAPES, FRAMES });
playground({
  name: 'beastie',
  noun: 'beastie',
  draw: beastie,
  dataUri: beastieDataUri,
  randomSeed,
  describe,
  swatch: (p) => [p.bg, p.body, p.screen, p.accent],
  groups: [
    shared.cells,
    shared.frame,
    {
      name: 'palette',
      legend: 'Hide',
      choices: [['auto', 'Seed picks'], ...PALETTES.map((p, i) => [String(i), p.name, p])],
    },
    shared.grid,
  ],
});
