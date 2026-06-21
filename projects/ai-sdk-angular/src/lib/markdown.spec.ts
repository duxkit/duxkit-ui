import type { Language } from 'highlight.js';
import { renderMarkdown } from './markdown';

const customLanguage = (): Language => ({
  name: 'Custom language',
  contains: [
    {
      scope: 'keyword',
      begin: 'customkw',
    },
  ],
});

describe('markdown', () => {
  it('renders unknown languages as escaped plain code', () => {
    const html = renderMarkdown('```unknown\nconst value = "<unsafe>";\n```');

    expect(html).toContain('data-streamdown="code-block"');
    expect(html).toContain('data-streamdown="code-block-header"');
    expect(html).toContain('data-streamdown="code-block-body"');
    expect(html).toContain('<span class="ai-code-block-language">unknown</span>');
    expect(html).toContain('class="ai-code-line"');
    expect(html).toContain('class="ai-code-line-number"');
    expect(html).not.toContain('</span>\n<span class="ai-code-line"');
    expect(html).toContain('language-unknown');
    expect(html).toContain('&lt;unsafe&gt;');
    expect(html).not.toContain('<unsafe>');
  });

  it('supports consumer registered languages through render options', () => {
    const html = renderMarkdown('```customlang\ncustomkw value\n```', {
      highlight: {
        languages: [
          {
            name: 'customlang',
            language: customLanguage,
          },
        ],
      },
    });

    expect(html).toContain('language-customlang');
    expect(html).toContain('<span class="ai-code-block-language">customlang</span>');
    expect(html).toContain('hljs-keyword');
  });

  it('can disable syntax highlighting', () => {
    const html = renderMarkdown('```ts\nconst value = 1;\n```', {
      highlight: {
        code: false,
      },
    });

    expect(html).toContain('language-ts');
    expect(html).not.toContain('hljs-keyword');
  });
});
