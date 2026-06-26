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

export const markdownContentClasses = 'ai-markdown markdown-body';

export const reasoningMarkdownContentClasses = 'ai-markdown ai-markdown-reasoning markdown-body';


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
