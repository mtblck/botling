/** A page's canonical URL, title and description, from its head. */
export function pageInfo(html: string): {
  url: string | undefined;
  title: string | undefined;
  description: string | undefined;
  noindex: boolean;
};
/** sitemap.xml for every indexable page. */
export function sitemap(urls: string[]): string;
/** robots.txt: everything may be crawled, and here is the sitemap. */
export function robots(): string;
/** llms.txt: what Seedkin is, how to use it, and every page worth reading. */
export function llms(site: {
  version: string;
  sections: { name: string; pages: { url: string; title: string; description: string }[] }[];
}): string;
/** The home page's structured data, as a JSON-LD block. */
export function jsonLd(pkg: { version: string; description: string }): string;
