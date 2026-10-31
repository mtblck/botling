import type { Traits } from '../types.js';

/** What sits on top of the head and beside it, once accessories and quirks have taken their places. */
export interface Slots {
  /** The seed's top piece is drawn. */
  hasTop: boolean;
  /** The seed's sides are drawn. */
  hasSides: boolean;
  /** The quirk is drawn: an accessory in its place hides it. */
  hasQuirk: boolean;
  /** Anything at all is drawn above the head. */
  isTopped: boolean;
}

/**
 * Works out which parts give way to others. An accessory takes the top
 * (bow, cap), the sides (headphones take both) or neither (visor); a
 * one-sided ear or antenna takes the sides or top, unless an accessory
 * already has them.
 *
 * @param t - The robot's traits
 * @returns Which parts are drawn
 */
export function slots(t: Traits): Slots {
  const a = t.accessory;
  const accessoryTop = a === 'headphones' || a === 'bow' || a === 'cap';
  const accessorySides = a === 'headphones';
  const hasQuirk = !(t.quirk === 'antenna' && accessoryTop) && !(t.quirk === 'ear' && accessorySides);
  const hasTop = !accessoryTop && !(hasQuirk && t.quirk === 'antenna');
  return {
    hasTop,
    hasSides: !accessorySides && !(hasQuirk && t.quirk === 'ear'),
    hasQuirk,
    isTopped: !hasTop || t.top !== 'none',
  };
}
