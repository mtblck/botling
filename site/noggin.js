// The Noggin playground, drawn from the package build at /lib; site/playground.js does the rest.
import {
  FRAMES,
  noggin,
  nogginDataUri,
  PALETTES,
  randomSeed,
  resolveTraits,
  SHAPES,
  SKIN_TONES,
} from '/lib/styles/noggin/index.js';
import { playground, sharedGroups } from '/playground.js';

/** Names the big Noggin for screen readers, so a change of seed or option is heard. */
function describe(seed, options) {
  const t = resolveTraits(seed, options);
  const tone = SKIN_TONES[t.skin].name.toLowerCase();
  const parts = [`${t.shape} cells`, `skin ${tone}`, `${t.hair === 'bald' ? 'no' : t.hair} hair`, `${t.eyes} eyes`];
  if (t.facial !== 'none') parts.push(`a ${t.facial}`);
  if (t.eyewear !== 'none') parts.push(t.eyewear);
  if (t.headwear !== 'none') parts.push(`a ${t.headwear}`);
  return `Noggin for "${seed}": ${parts.join(', ')}, in a ${PALETTES[t.palette].name.toLowerCase()} shirt`;
}

const shared = sharedGroups({ SHAPES, FRAMES });
playground({
  name: 'noggin',
  noun: 'noggin',
  draw: noggin,
  dataUri: nogginDataUri,
  randomSeed,
  describe,
  swatch: (p) => [p.bg, p.screen, p.screen, p.accent],
  groups: [
    shared.cells,
    shared.frame,
    {
      name: 'skin',
      legend: 'Skin tone',
      choices: [['auto', 'Seed picks'], ...SKIN_TONES.map((s, i) => [String(i), s.name, Array(4).fill(s.body)])],
    },
    {
      name: 'palette',
      legend: 'Outfit',
      choices: [['auto', 'Seed picks'], ...PALETTES.map((p, i) => [String(i), p.name, p])],
    },
    shared.grid,
  ],
});
