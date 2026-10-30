// Readable random seeds, adjective-noun-number: 20 x 20 x 1000 = 400,000 of
// them. Not part of the output contract (ADR 0006): these lists can change
// in a minor, since a seed already handed out keeps drawing its robot.
const ADJECTIVES: readonly string[] = [
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
const NOUNS: readonly string[] = [
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

/** The part of Web Crypto this needs; in browsers, Node and edge runtimes alike. */
type RandomSource = { getRandomValues(array: Uint32Array): Uint32Array };

/** A float in [0, 1) from the platform's crypto source, or Math.random without one. */
function platformRandom(): number {
  const source = (globalThis as { crypto?: RandomSource }).crypto;
  if (!source) return Math.random();
  return (source.getRandomValues(new Uint32Array(1))[0] ?? 0) / 4294967296;
}

/**
 * A readable random seed, like `plucky-servo-427`. Store it with the user:
 * the same seed always draws the same robot, but each call gives a new seed.
 * It is for picking a robot, not an id. Two calls can return the same seed,
 * so to give every user their own robot, seed with their user id instead.
 *
 * @param random - A source of floats in [0, 1); defaults to `crypto.getRandomValues`
 * @returns A seed such as `plucky-servo-427`
 */
export function randomSeed(random: () => number = platformRandom): string {
  // Clamped, so a source that strays outside [0, 1) still gives a real word.
  const index = (n: number): number => Math.min(n - 1, Math.max(0, Math.floor(random() * n)));
  const pick = (list: readonly string[]): string => list[index(list.length)] as string;
  return `${pick(ADJECTIVES)}-${pick(NOUNS)}-${index(1000)}`;
}
