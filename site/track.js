// "Used it" counts for mattblack.space/analytics (mtblck/boards, docs/events.md).
// A beacon carries the event's name and, for a page view, the referring site's
// hostname; never this page's URL, so seeds in the hash stay in the browser.
// Boards keeps daily totals per event and nothing about the person.

/** The only host that counts, so localhost and preview deployments stay out. */
export const HOST = 'botling.me';

/**
 * Arrival fields for a page view: from another site (or none), it's a visit,
 * with the referrer's hostname and nothing else from its URL.
 */
export function arrival(referrer, host) {
  let ref = '';
  try {
    ref = referrer ? new URL(referrer).hostname : '';
  } catch {
    // An unparseable referrer counts as direct.
  }
  return ref === host ? {} : { visit: true, ref };
}

/** The beacon body for an event. */
export function body(event, extra = {}) {
  return JSON.stringify({ ...extra, project: 'botling', event });
}

/**
 * Counts an event on botling.me; does nothing anywhere else. `sendBeacon` with a
 * string is a text/plain POST, so there's no CORS preflight, and a navigation
 * doesn't cancel it. /_mb/events is rewritten to Boards in vercel.json.
 */
export function track(event, extra) {
  if (globalThis.location?.hostname !== HOST || typeof globalThis.navigator?.sendBeacon !== 'function') return;
  navigator.sendBeacon('/_mb/events', body(event, extra));
}
