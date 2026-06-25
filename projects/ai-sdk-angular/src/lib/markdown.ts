import {
  ENVIRONMENT_INITIALIZER,
  InjectionToken,
  makeEnvironmentProviders,
  type EnvironmentProviders,
} from '@angular/core';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import { Marked, type Tokens } from 'marked';
import type { LanguageFn } from 'highlight.js';

export const markdownContentClasses = 'ai-markdown';

export const reasoningMarkdownContentClasses = 'ai-markdown ai-markdown-reasoning';

export const markdownStyles = `
  .ai-markdown {
    --ai-markdown-code-bg: var(--sidebar);
    --ai-markdown-code-border: var(--border);
    --ai-markdown-code-color: var(--foreground);
    --ai-markdown-code-comment: var(--muted-foreground);
    --ai-markdown-code-gutter: var(--muted-foreground);
    --ai-markdown-code-inline-bg: var(--muted);
    --ai-markdown-code-keyword: var(--foreground);
    --ai-markdown-code-label: var(--muted-foreground);
    --ai-markdown-code-muted: var(--muted-foreground);
    --ai-markdown-code-radius: 0.625rem;
    --ai-markdown-code-string: var(--foreground);
    --ai-markdown-code-surface: var(--background);
    --ai-markdown-table-border: var(--border);
    --ai-markdown-table-header-bg: var(--muted);
    --ai-markdown-table-radius: 0.375rem;

    min-width: 0;
    max-width: 100%;
    overflow: hidden;
  }

  .ai-markdown p {
    margin: 0;
  }

  .ai-markdown p + p,
  .ai-markdown :not(p) + p,
  .ai-markdown p + :not(p) {
    margin-top: 0.5rem;
  }

  .ai-markdown strong {
    font-weight: 600;
  }

  .ai-markdown ul,
  .ai-markdown ol {
    margin: 0;
    padding-left: 1.25rem;
  }

  .ai-markdown ul {
    list-style-type: disc;
  }

  .ai-markdown ol {
    list-style-type: decimal;
  }

  .ai-markdown li {
    margin: 0;
  }

  .ai-markdown blockquote {
    margin: 0;
    border-left: 2px solid var(--ai-markdown-table-border);
    padding-left: 0.75rem;
    color: var(--muted-foreground);
  }

  .ai-markdown code {
    border-radius: 0.25rem;
    background: var(--ai-markdown-code-inline-bg);
    padding: 0.125rem 0.25rem;
    color: var(--ai-markdown-code-color);
  }

  .ai-markdown table {
    width: 100%;
    max-width: 100%;
    overflow: hidden;
    border-collapse: collapse;
    border-radius: var(--ai-markdown-table-radius);
    font-size: 0.875rem;
  }

  .ai-markdown th,
  .ai-markdown td {
    border: 1px solid var(--ai-markdown-table-border);
    padding: 0.5rem 0.75rem;
  }

  .ai-markdown th {
    background: var(--ai-markdown-table-header-bg);
    text-align: left;
  }

  .ai-markdown tbody tr:last-child td {
    border-bottom-width: 1px;
  }

  .ai-code-block {
    --ai-markdown-code-bg: var(--sidebar);
    --ai-markdown-code-border: var(--border);
    --ai-markdown-code-color: var(--foreground);
    --ai-markdown-code-comment: var(--muted-foreground);
    --ai-markdown-code-gutter: var(--muted-foreground);
    --ai-markdown-code-inline-bg: var(--muted);
    --ai-markdown-code-keyword: var(--foreground);
    --ai-markdown-code-label: var(--muted-foreground);
    --ai-markdown-code-muted: var(--muted-foreground);
    --ai-markdown-code-radius: 0.625rem;
    --ai-markdown-code-string: var(--foreground);
    --ai-markdown-code-surface: var(--background);

    margin: 1rem 0;
    display: flex;
    width: 100%;
    min-width: 0;
    max-width: 100%;
    flex-direction: column;
    gap: 0.5rem;
    border: 1px solid var(--ai-markdown-code-border);
    border-radius: var(--ai-markdown-code-radius);
    background: var(--ai-markdown-code-bg);
    padding: 0.5rem;
  }

  .ai-code-block-header {
    display: flex;
    height: 2rem;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    color: var(--ai-markdown-code-label);
    font-size: 0.75rem;
  }

  .ai-code-block-language {
    margin-left: 0.25rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    text-transform: lowercase;
  }

  .ai-code-block-actions {
    flex-shrink: 0;
  }

  .ai-code-block-body {
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
    border: 1px solid var(--ai-markdown-code-border);
    border-radius: 0.375rem;
    background: var(--ai-markdown-code-surface);
    padding: 1rem;
    font-size: 0.875rem;
  }

  .ai-code-block-body pre {
    max-width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    background: transparent;
  }

  .ai-code-block code {
    display: block;
    background: transparent;
    padding: 0;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-size: 0.875rem;
    line-height: 1.5rem;
  }

  .ai-code-line {
    display: block;
    min-height: 1.5rem;
    white-space: pre;
  }

  .ai-code-line-number {
    margin-right: 1rem;
    display: inline-block;
    width: 1.5rem;
    user-select: none;
    text-align: right;
    color: var(--ai-markdown-code-gutter);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-size: 13px;
  }

  .ai-markdown .hljs-attr,
  .ai-markdown .hljs-literal,
  .ai-markdown .hljs-number,
  .ai-markdown .hljs-property,
  .ai-markdown .hljs-type,
  .ai-markdown .hljs-variable,
  .ai-code-block .hljs-attr,
  .ai-code-block .hljs-literal,
  .ai-code-block .hljs-number,
  .ai-code-block .hljs-property,
  .ai-code-block .hljs-type,
  .ai-code-block .hljs-variable {
    color: var(--ai-markdown-code-muted);
  }

  .ai-markdown .hljs-built_in,
  .ai-markdown .hljs-title,
  .ai-code-block .hljs-built_in,
  .ai-code-block .hljs-title {
    color: var(--ai-markdown-code-keyword);
  }

  .ai-markdown .hljs-keyword,
  .ai-code-block .hljs-keyword {
    color: var(--ai-markdown-code-keyword);
    font-weight: 500;
  }

  .ai-markdown .hljs-comment,
  .ai-markdown .hljs-meta,
  .ai-code-block .hljs-comment,
  .ai-code-block .hljs-meta {
    color: var(--ai-markdown-code-comment);
  }

  .ai-markdown .hljs-string,
  .ai-code-block .hljs-string {
    color: var(--ai-markdown-code-string);
  }

  .ai-markdown-reasoning {
    --ai-markdown-code-color: var(--muted-foreground);
    --ai-markdown-code-keyword: var(--muted-foreground);
    --ai-markdown-code-string: var(--muted-foreground);

    color: var(--muted-foreground);
  }

  .ai-markdown-reasoning :where(p, li, ol, ul, strong) {
    color: inherit;
  }

  .ai-markdown-reasoning p {
    margin: 0;
  }

  .ai-markdown-reasoning p + p,
  .ai-markdown-reasoning :not(p) + p,
  .ai-markdown-reasoning p + :not(p) {
    margin-top: 0.5rem;
  }

  .ai-markdown-reasoning li {
    margin: 0.25rem 0;
  }

  .ai-markdown-reasoning ol > li + li {
    margin-top: 0.5rem;
  }

  .ai-markdown-reasoning code:not(.hljs),
  .ai-markdown-reasoning .ai-code-block {
    color: var(--foreground);
  }
`;

export interface AiMarkdownOptions {
  readonly highlight?: AiMarkdownHighlightOptions;
}

export interface AiMarkdownHighlightOptions {
  readonly code?: boolean;
  readonly languages?: readonly AiMarkdownLanguage[];
}

export interface AiMarkdownLanguage {
  readonly name: string;
  readonly language: LanguageFn;
  readonly aliases?: readonly string[];
}

export type AiMarkdownBlock = AiMarkdownHtmlBlock | AiMarkdownCodeBlock;

export interface AiMarkdownHtmlBlock {
  readonly id: string;
  readonly type: 'html';
  readonly html: string;
}

export interface AiMarkdownCodeBlock {
  readonly id: string;
  readonly type: 'code';
  readonly code: string;
  readonly language: string;
}

export const AI_MARKDOWN_OPTIONS = new InjectionToken<AiMarkdownOptions>('AI_MARKDOWN_OPTIONS', {
  factory: () => ({}),
});

export function provideAiMarkdown(options: AiMarkdownOptions = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: AI_MARKDOWN_OPTIONS,
      useValue: options,
    },
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => registerMarkdownLanguages(options.highlight?.languages ?? []),
    },
  ]);
}

export function registerMarkdownLanguage(
  name: string,
  language: LanguageFn,
  aliases: readonly string[] = [],
): void {
  registerLanguage(name, language);

  for (const alias of aliases) {
    hljs.registerAliases(alias, { languageName: name });
  }
}

registerDefaultLanguages();

export function renderMarkdown(markdown: string, options: AiMarkdownOptions = {}): string {
  registerMarkdownLanguages(options.highlight?.languages ?? []);

  const marked = new Marked({
    renderer: {
      code(token: Tokens.Code): string {
        return renderCodeBlock(token, options);
      },
    },
  });

  return marked.parse(markdown, {
    async: false,
    gfm: true,
    silent: true,
  });
}

export function parseMarkdownBlocks(
  markdown: string,
  options: AiMarkdownOptions = {},
): AiMarkdownBlock[] {
  registerMarkdownLanguages(options.highlight?.languages ?? []);

  const tokens = new Marked({ gfm: true }).lexer(markdown);
  const blocks: AiMarkdownBlock[] = [];
  const pendingTokens: Tokens.Generic[] = [];

  const flushPendingTokens = (): void => {
    if (pendingTokens.length === 0) {
      return;
    }

    const rawMarkdown = pendingTokens.map((token) => token.raw).join('');
    const html = renderMarkdown(rawMarkdown, options).trim();

    if (html.length > 0) {
      blocks.push({
        id: `html-${blocks.length}`,
        type: 'html',
        html,
      });
    }

    pendingTokens.length = 0;
  };

  for (const token of tokens) {
    if (token.type === 'code') {
      flushPendingTokens();

      blocks.push({
        id: `code-${blocks.length}`,
        type: 'code',
        code: token.text,
        language: getLanguage(token.lang) ?? 'text',
      });

      continue;
    }

    pendingTokens.push(token);
  }

  flushPendingTokens();

  return blocks;
}

export function renderHighlightedCode(
  code: string,
  language: string | undefined,
  options: AiMarkdownOptions = {},
): string {
  registerMarkdownLanguages(options.highlight?.languages ?? []);

  const normalizedLanguage = getLanguage(language);

  if (
    options.highlight?.code === false ||
    !normalizedLanguage ||
    !hljs.getLanguage(normalizedLanguage)
  ) {
    return renderCodeLines(escapeHtml(code));
  }

  try {
    const result = hljs.highlight(code, {
      language: normalizedLanguage,
      ignoreIllegals: true,
    });

    return renderCodeLines(result.value);
  } catch {
    return renderCodeLines(escapeHtml(code));
  }
}

function registerDefaultLanguages(): void {
  registerMarkdownLanguage('bash', bash, ['sh', 'shell', 'zsh']);
  registerMarkdownLanguage('css', css);
  registerMarkdownLanguage('javascript', javascript, ['js', 'jsx']);
  registerMarkdownLanguage('json', json);
  registerMarkdownLanguage('markdown', markdown, ['md']);
  registerMarkdownLanguage('typescript', typescript, ['ts', 'tsx']);
  registerMarkdownLanguage('xml', xml, ['html', 'svg']);
}

function renderCodeBlock(token: Tokens.Code, options: AiMarkdownOptions): string {
  const language = getLanguage(token.lang);
  const escapedLanguage = language ? escapeHtml(language) : '';
  const className = ['hljs', escapedLanguage ? `language-${escapedLanguage}` : '']
    .filter(Boolean)
    .join(' ');

  if (options.highlight?.code === false || !language || !hljs.getLanguage(language)) {
    return renderCodeBlockHtml({
      className,
      code: escapeHtml(token.text),
      language: escapedLanguage,
    });
  }

  try {
    const result = hljs.highlight(token.text, {
      language,
      ignoreIllegals: true,
    });

    return renderCodeBlockHtml({
      className,
      code: result.value,
      language: escapedLanguage,
    });
  } catch {
    return renderCodeBlockHtml({
      className,
      code: escapeHtml(token.text),
      language: escapedLanguage,
    });
  }
}

function renderCodeBlockHtml({
  className,
  code,
  language,
}: {
  className: string;
  code: string;
  language: string;
}): string {
  const label = language || 'text';

  return [
    `<div class="ai-code-block" data-language="${label}" data-streamdown="code-block" style="content-visibility:auto;contain-intrinsic-size:auto 200px;">`,
    `<div class="ai-code-block-header" data-language="${label}" data-streamdown="code-block-header"><span class="ai-code-block-language">${label}</span></div>`,
    `<div class="ai-code-block-body language-${label}" data-language="${label}" data-streamdown="code-block-body">`,
    `<pre class="language-${label}"><code class="${className}">${renderCodeLines(code)}</code></pre>`,
    '</div>',
    '</div>',
    '',
  ].join('\n');
}

function renderCodeLines(code: string): string {
  const lines = code.endsWith('\n') ? code.slice(0, -1).split('\n') : code.split('\n');

  return lines
    .map((line, index) =>
      [
        `<span class="ai-code-line" data-line="${index + 1}">`,
        `<span class="ai-code-line-number" aria-hidden="true">${index + 1}</span>`,
        line || ' ',
        '</span>',
      ].join(''),
    )
    .join('');
}

function getLanguage(language: string | undefined): string | undefined {
  return language?.trim().split(/\s+/)[0]?.toLowerCase();
}

function registerLanguage(name: string, language: LanguageFn): void {
  if (!hljs.getLanguage(name)) {
    hljs.registerLanguage(name, language);
  }
}

function registerMarkdownLanguages(languages: readonly AiMarkdownLanguage[]): void {
  for (const item of languages) {
    registerMarkdownLanguage(item.name, item.language, item.aliases ?? []);
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
