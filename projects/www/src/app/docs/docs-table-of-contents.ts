import { type ComponentApiSymbolMetadata } from './component-api-metadata.generated';

export interface DocsTableOfContentsItem {
  readonly id: string;
  readonly label: string;
  readonly items?: readonly DocsTableOfContentsItem[];
}

export const docsPageSections = [
  { id: 'install', label: 'Install' },
  { id: 'anatomy', label: 'Anatomy' },
  { id: 'preview', label: 'Preview' },
  { id: 'api', label: 'API' },
  { id: 'related-primitives', label: 'Related Primitives' },
] as const satisfies readonly DocsTableOfContentsItem[];

export function buildComponentDocsTableOfContents(
  symbols: readonly ComponentApiSymbolMetadata[],
): readonly DocsTableOfContentsItem[] {
  const apiSymbolItems = symbols.map((symbol) => ({
    id: apiSymbolHeadingId(symbol.name),
    label: symbol.name,
  }));

  return docsPageSections.map((section) =>
    section.id === 'api' ? { ...section, items: apiSymbolItems } : section,
  );
}

export function apiSymbolHeadingId(symbolName: string): string {
  return `api-${symbolName
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()}`;
}

export function flattenDocsTableOfContentsItems(
  items: readonly DocsTableOfContentsItem[],
): readonly DocsTableOfContentsItem[] {
  return items.flatMap((item) => (item.items ? [item, ...item.items] : [item]));
}
