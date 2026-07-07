import {
  componentApiMetadata,
  type ComponentApiMetadata,
} from '../data/component-api-metadata.generated';
import { type ComponentDoc, type ComponentDocSlug, componentDocs } from '../data/component-docs.registry';
import { componentHref } from '../data/docs-navigation';

export type ComponentDocsSearchItem = ComponentDoc & {
  readonly href: string;
  readonly api: ComponentApiMetadata;
  readonly searchText: string;
};

export const componentDocsSearchIndex: readonly ComponentDocsSearchItem[] = componentDocs.map(
  (doc) => {
    const api = componentApiMetadata[doc.slug];
    const searchableValues = [
      doc.title,
      doc.slug,
      doc.description,
      ...api.selectors,
      ...api.exports,
      ...api.inputs,
      ...api.outputs,
      ...api.sourcePaths,
      ...api.symbols.flatMap((symbol) => [
        ...symbol.inputs.flatMap((input) => [input.description ?? '']),
        ...symbol.outputs.flatMap((output) => [output.description ?? '']),
      ]),
    ];

    return {
      ...doc,
      href: componentHref(doc.slug),
      api,
      searchText: normalizeSearchText(searchableValues.join(' ')),
    };
  },
);

export function searchComponentDocs(query: string): readonly ComponentDocsSearchItem[] {
  const terms = getSearchTerms(query);

  if (terms.length === 0) {
    return componentDocsSearchIndex;
  }

  return componentDocsSearchIndex
    .map((item) => ({
      item,
      score: scoreSearchItem(item, terms),
    }))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
    .map((result) => result.item);
}

export function matchesDocsSearchText(value: string, query: string): boolean {
  const terms = getSearchTerms(query);

  if (terms.length === 0) {
    return true;
  }

  const normalizedValue = normalizeSearchText(value);
  return terms.every((term) => normalizedValue.includes(term));
}

function scoreSearchItem(item: ComponentDocsSearchItem, terms: readonly string[]): number {
  return terms.reduce((score, term) => {
    if (!item.searchText.includes(term)) {
      return 0;
    }

    if (normalizeSearchText(item.title) === term || item.slug === term) {
      return score + 12;
    }

    if (item.api.selectors.some((selector) => normalizeSearchText(selector).includes(term))) {
      return score + 8;
    }

    if (item.api.exports.some((exportName) => normalizeSearchText(exportName).includes(term))) {
      return score + 6;
    }

    if (item.api.inputs.some((input) => normalizeSearchText(input).includes(term))) {
      return score + 4;
    }

    if (item.api.outputs.some((output) => normalizeSearchText(output).includes(term))) {
      return score + 4;
    }

    return score + 1;
  }, 0);
}

export function normalizeSearchText(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .toLowerCase();
}

function getSearchTerms(query: string): readonly string[] {
  return normalizeSearchText(query)
    .split(' ')
    .filter((term) => term.length > 0);
}
