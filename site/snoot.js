// The Snoot playground, drawn from the package build at /lib; site/playground.js does the rest.
import { FRAMES, PALETTES, randomSeed, resolveTraits, SHAPES, snoot, snootDataUri } from '/lib/styles/snoot/index.js';
import { playground, sharedGroups } from '/playground.js';

/** Names the big Snoot for screen readers, so a change of seed or option is heard. */
function describe(seed, options) {
  const t = resolveTraits(seed, options);
  const parts = [`${t.shape} cells`, `${PALETTES[t.palette].name} coat`, `${t.eyes} eyes`];
  if (t.marking !== 'none') parts.push(`${t.marking === 'spots' ? 'spotted' : t.marking} markings`);
  if (t.extra !== 'none') parts.push(t.extra === 'whiskers' ? 'whiskers' : `a ${t.extra}`);
  return `Snoot for "${seed}": a ${t.species}, ${parts.join(', ')}`;
}

const shared = sharedGroups({ SHAPES, FRAMES });
playground({
  name: 'snoot',
  noun: 'snoot',
  draw: snoot,
  dataUri: snootDataUri,
  randomSeed,
  describe,
  swatch: (p) => [p.bg, p.body, p.screen, p.accent],
  groups: [
    shared.cells,
    shared.frame,
    {
      name: 'palette',
      legend: 'Coat',
      choices: [['auto', 'Seed picks'], ...PALETTES.map((p, i) => [String(i), p.name, p])],
    },
    shared.grid,
  ],
});
