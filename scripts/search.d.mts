/** Search entries for one page: the page, then its headings. */
export function searchEntries(page: {
  path: string;
  title: string;
  description: string;
  html: string;
}): { url: string; title: string; page: string; text: string }[];
