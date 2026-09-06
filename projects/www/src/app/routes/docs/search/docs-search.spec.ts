import { componentApiMetadata } from '../data/component-api-metadata.generated';
import '@angular/compiler';
import { describe, expect, it } from 'vitest';
import {
  componentDocsSearchIndex,
  matchesDocsSearchText,
  normalizeSearchText,
  searchComponentDocs,
} from './docs-search';
import { componentDocs } from '../data/component-docs.registry';
import { anatomySnippets, componentImports } from '../data/component-doc-snippets';
import { componentPreviewSnippets } from '../components/component-doc-preview.component';
import { componentComposition } from '../data/component-composition';

describe('docs search', () => {
  it('finds behavioral APIs and migration guidance beyond input/output tables', () => {
    expect(searchComponentDocs('notifyMessageAdded').map((item) => item.slug)).toContain(
      'conversation',
    );
    expect(searchComponentDocs('selectSliderValue').map((item) => item.slug)).toContain(
      'reasoning-effort',
    );
    expect(
      searchComponentDocs('button status input was removed').map((item) => item.slug),
    ).toContain('prompt-input');
  });
  it('matches component docs by title, selector, export, and API metadata', () => {
    expect(searchComponentDocs('reasoning').map((item) => item.slug)).toContain('reasoning');
    expect(searchComponentDocs('ai-message-content').map((item) => item.slug)).toContain('message');
    expect(searchComponentDocs('ConversationScrollAnchor').map((item) => item.slug)).toContain(
      'conversation',
    );
    expect(searchComponentDocs('MessageThumbsUp').map((item) => item.slug)).toContain('message');
    expect(searchComponentDocs('checkpoint').map((item) => item.slug)).toContain('checkpoint');
    expect(searchComponentDocs('ai-checkpoint').map((item) => item.slug)).toContain('checkpoint');
    expect(searchComponentDocs('CheckpointTrigger').map((item) => item.slug)).toContain(
      'checkpoint',
    );
    expect(searchComponentDocs('checkpointRestore').map((item) => item.slug)).toContain(
      'checkpoint',
    );
    expect(searchComponentDocs('restore trigger is pressed').map((item) => item.slug)).toContain(
      'checkpoint',
    );
    expect(searchComponentDocs('context').map((item) => item.slug)).toContain('context');
    expect(searchComponentDocs('ai-context').map((item) => item.slug)).toContain('context');
    expect(searchComponentDocs('ContextTrigger').map((item) => item.slug)).toContain('context');
    expect(searchComponentDocs('usedTokens').map((item) => item.slug)).toContain('context');
    expect(searchComponentDocs('Model identifier').map((item) => item.slug)).toContain('context');
    expect(searchComponentDocs('prompt input').map((item) => item.slug)).toContain('prompt-input');
    expect(searchComponentDocs('aiPromptInputTextarea').map((item) => item.slug)).toContain(
      'prompt-input',
    );
    expect(searchComponentDocs('promptSubmit').map((item) => item.slug)).toContain('prompt-input');
    expect(searchComponentDocs('ReasoningContent').map((item) => item.slug)).toContain('reasoning');
    expect(searchComponentDocs('reasoning effort').map((item) => item.slug)).toContain(
      'reasoning-effort',
    );
    expect(searchComponentDocs('ai-reasoning-effort-slider').map((item) => item.slug)).toContain(
      'reasoning-effort',
    );
    expect(searchComponentDocs('ReasoningEffortList').map((item) => item.slug)).toContain(
      'reasoning-effort',
    );
    expect(searchComponentDocs('thumbClass').map((item) => item.slug)).toContain(
      'reasoning-effort',
    );
    expect(searchComponentDocs('valueChange').map((item) => item.slug)).toContain(
      'reasoning-effort',
    );
    expect(
      searchComponentDocs('Emits after this item is selected').map((item) => item.slug),
    ).toContain('reasoning-effort');
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
    expect(searchComponentDocs('shimmer').map((item) => item.slug)).toContain('shimmer');
    expect(searchComponentDocs('ai-shimmer').map((item) => item.slug)).toContain('shimmer');
    expect(searchComponentDocs('duration').map((item) => item.slug)).toContain('shimmer');
    expect(searchComponentDocs('text length').map((item) => item.slug)).toContain('shimmer');
  });

  it('documents inherited inputs and model outputs on the consumer-facing symbols', () => {
    const code = componentApiMetadata['code-block'].symbols.find(
      (symbol) => symbol.name === 'CodeBlock',
    );
    expect(code?.inputs).toContainEqual(expect.objectContaining({ name: 'code', required: true }));
    const content = componentApiMetadata.reasoning.symbols.find(
      (symbol) => symbol.name === 'ReasoningContent',
    );
    expect(content?.inputs).toContainEqual(
      expect.objectContaining({ name: 'expanded', required: false }),
    );
    expect(content?.outputs).toContainEqual(expect.objectContaining({ name: 'expandedChange' }));
    const context = componentApiMetadata.context.symbols.find(
      (symbol) => symbol.name === 'Context',
    );
    expect(context?.inputs).toContainEqual(
      expect.objectContaining({ name: 'usedTokens', required: true }),
    );
  });

  it('keeps generated API metadata attached to every indexed component doc', () => {
    expect(componentDocsSearchIndex).toHaveLength(componentDocs.length);

    for (const item of componentDocsSearchIndex) {
      expect(item.api.selectors.length).toBeGreaterThan(0);
      expect(item.api.exports.length).toBeGreaterThan(0);
      expect(item.href).toBe(`/components/${item.slug}`);
    }
  });

  it('uses the same camel-case normalization for command item filtering', () => {
    const reasoning = componentDocsSearchIndex.find((item) => item.slug === 'reasoning');
    const message = componentDocsSearchIndex.find((item) => item.slug === 'message');

    expect(reasoning).toBeDefined();
    expect(message).toBeDefined();
    expect(normalizeSearchText('ReasoningContent')).toBe('reasoning content');
    expect(matchesDocsSearchText(reasoning?.searchText ?? '', 'ReasoningContent')).toBe(true);
    expect(matchesDocsSearchText(message?.searchText ?? '', 'MessageThumbsUp')).toBe(true);
  });
});

describe('component docs snippets', () => {
  it('keeps import, anatomy, and preview snippets for every registered component doc', () => {
    for (const doc of componentDocs) {
      expect(componentImports[doc.slug]).toContain("from './components/ai/");
      expect(anatomySnippets[doc.slug].trim().length).toBeGreaterThan(0);
      expect(componentPreviewSnippets[doc.slug].trim().length).toBeGreaterThan(0);
      expect(componentComposition[doc.slug].notes.length).toBeGreaterThan(0);
    }
  });
});
