import { describe, expect, it } from 'vitest';
import { componentApiMetadata } from '../data/component-api-metadata.generated';
import {
  apiSymbolHeadingId,
  buildComponentDocsTableOfContents,
  docsPageSections,
} from './docs-table-of-contents';

describe('docs table of contents', () => {
  it('keeps stable top-level docs section anchors', () => {
    expect(docsPageSections).toEqual([
      { id: 'install', label: 'Install' },
      { id: 'anatomy', label: 'Anatomy' },
      { id: 'preview', label: 'Preview' },
      { id: 'api', label: 'API' },
      { id: 'related-components', label: 'Related components' },
    ]);
  });

  it('nests API symbol names under the API section only', () => {
    const toc = buildComponentDocsTableOfContents(componentApiMetadata['chain-of-thought'].symbols);
    const apiSection = toc.find((item) => item.id === 'api');

    expect(apiSection?.items?.map((item) => item.label)).toEqual([
      'ChainOfThought',
      'ChainOfThoughtContent',
      'ChainOfThoughtTrigger',
      'ChainOfThoughtImageCaption',
      'ChainOfThoughtImage',
      'ChainOfThoughtSearchResult',
      'ChainOfThoughtSearchResults',
      'ChainOfThoughtStepDescription',
      'ChainOfThoughtStepIcon',
      'ChainOfThoughtStepLabel',
      'ChainOfThoughtStep',
    ]);
    expect(apiSection?.items?.map((item) => item.id)).toEqual([
      'api-chain-of-thought',
      'api-chain-of-thought-content',
      'api-chain-of-thought-trigger',
      'api-chain-of-thought-image-caption',
      'api-chain-of-thought-image',
      'api-chain-of-thought-search-result',
      'api-chain-of-thought-search-results',
      'api-chain-of-thought-step-description',
      'api-chain-of-thought-step-icon',
      'api-chain-of-thought-step-label',
      'api-chain-of-thought-step',
    ]);
    expect(toc.filter((item) => item.items !== undefined).map((item) => item.id)).toEqual(['api']);
  });

  it('creates readable and stable API symbol heading ids', () => {
    expect(apiSymbolHeadingId('ChainOfThoughtSearchResult')).toBe(
      'api-chain-of-thought-search-result',
    );
    expect(apiSymbolHeadingId('PromptInputSelectTrigger')).toBe('api-prompt-input-select-trigger');
  });
});
