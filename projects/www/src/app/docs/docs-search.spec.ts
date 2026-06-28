import { describe, expect, it } from 'vitest';
import {
  componentDocsSearchIndex,
  matchesDocsSearchText,
  normalizeSearchText,
  searchComponentDocs,
} from './docs-search';
import { componentDocs } from './component-docs.registry';

describe('docs search', () => {
  it('matches component docs by title, selector, export, and API metadata', () => {
    expect(searchComponentDocs('reasoning').map((item) => item.slug)).toContain('reasoning');
    expect(searchComponentDocs('ai-message-content').map((item) => item.slug)).toContain('message');
    expect(searchComponentDocs('ConversationScrollAnchor').map((item) => item.slug)).toContain(
      'conversation',
    );
    expect(searchComponentDocs('MessageActionsThumbsUp').map((item) => item.slug)).toContain(
      'message',
    );
    expect(searchComponentDocs('ReasoningContent').map((item) => item.slug)).toContain('reasoning');
    expect(searchComponentDocs('collapsedMaxHeight').map((item) => item.slug)).toEqual(
      expect.arrayContaining(['reasoning', 'chain-of-thought']),
    );
    expect(searchComponentDocs('successful copy action').map((item) => item.slug)).toContain(
      'message',
    );
    expect(searchComponentDocs('attachment').map((item) => item.slug)).toContain('attachment');
    expect(searchComponentDocs('ai-attachment-preview').map((item) => item.slug)).toContain(
      'attachment',
    );
    expect(searchComponentDocs('remove control is pressed').map((item) => item.slug)).toContain(
      'attachment',
    );
    expect(searchComponentDocs('SourcesTrigger').map((item) => item.slug)).toContain('sources');
    expect(searchComponentDocs('ai-sources-content').map((item) => item.slug)).toContain('sources');
    expect(searchComponentDocs('source link').map((item) => item.slug)).toContain('sources');
  });

  it('keeps generated API metadata attached to every indexed component doc', () => {
    expect(componentDocsSearchIndex).toHaveLength(componentDocs.length);

    for (const item of componentDocsSearchIndex) {
      expect(item.api.selectors.length).toBeGreaterThan(0);
      expect(item.api.exports.length).toBeGreaterThan(0);
      expect(item.href).toBe(`/docs/components/${item.slug}`);
    }
  });

  it('uses the same camel-case normalization for command item filtering', () => {
    const reasoning = componentDocsSearchIndex.find((item) => item.slug === 'reasoning');
    const message = componentDocsSearchIndex.find((item) => item.slug === 'message');

    expect(reasoning).toBeDefined();
    expect(message).toBeDefined();
    expect(normalizeSearchText('ReasoningContent')).toBe('reasoning content');
    expect(matchesDocsSearchText(reasoning?.searchText ?? '', 'ReasoningContent')).toBe(true);
    expect(matchesDocsSearchText(message?.searchText ?? '', 'MessageActionsThumbsUp')).toBe(true);
  });
});
