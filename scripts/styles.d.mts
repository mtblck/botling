/** A style as the site shows it. */
export interface SiteStyle {
  name: string;
  title: string;
  status: 'stable' | 'preview';
  label: string;
  kind: string;
  defaultTitle: string;
  moves: string;
  /** How it moves below 40px, after "and"; default: it only blinks and hovers. */
  smallMoves?: string;
  /** The shape option's default, when the seed doesn't pick it. */
  shapeDefault?: string;
  parts: [string, string][];
  palette: string;
  details?: [string, string][];
  options: [string, string, string, string][];
}
/** Every style in the order the site shows them. */
export const STYLES: SiteStyle[];
/** The style a site file is the page of, or undefined for any other page. */
export function styleOf(file: string): string | undefined;
/** The tabs between styles. */
export function styleTabs(name: string): string;
/** The playground's markup, from the partial with the style's words in. */
export function playground(template: string, name: string): string;
/** The "Use it" section: usage, details, the options table and the next style. */
export function styleGuide(name: string, lib: Record<string, unknown>, kb: string): string;
