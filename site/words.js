// Friendly random seeds for the Random and Shuffle buttons: adjective-noun-number.
const ADJ = [
  'brave',
  'tiny',
  'rusty',
  'shiny',
  'sleepy',
  'zippy',
  'jolly',
  'nifty',
  'quiet',
  'bouncy',
  'clever',
  'cosmic',
  'fuzzy',
  'lucky',
  'mighty',
  'plucky',
  'sunny',
  'witty',
  'chrome',
  'turbo',
];
const NOUN = [
  'bolt',
  'sprocket',
  'gizmo',
  'widget',
  'circuit',
  'piston',
  'gadget',
  'servo',
  'rivet',
  'beacon',
  'dynamo',
  'pixel',
  'socket',
  'gear',
  'diode',
  'rocket',
  'magnet',
  'module',
  'byte',
  'spark',
];
const pick = (list) => list[Math.floor(Math.random() * list.length)];

/** A readable random seed, like "plucky-servo-42". */
export function randomSeed() {
  return `${pick(ADJ)}-${pick(NOUN)}-${Math.floor(Math.random() * 100)}`;
}
