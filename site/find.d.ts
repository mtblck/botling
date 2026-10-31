// Types for find.js, so test/site.test.ts type-checks against the plain-JS site module.
export interface SearchEntry {
  url: string;
  title: string;
  /** The page an entry belongs to; for a page itself, its own title. */
  page: string;
  text: string;
}
export function find(index: SearchEntry[], query: string, limit?: number): SearchEntry[];
