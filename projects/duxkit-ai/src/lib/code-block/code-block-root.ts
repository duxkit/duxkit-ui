import { DOCUMENT } from '@angular/common';
import { DestroyRef, Directive, computed, inject, input, signal } from '@angular/core';
import { AI_MARKDOWN_OPTIONS, renderHighlightedCode } from 'duxkit-ai/markdown';
import { twMerge } from 'tailwind-merge';

const languageExtensions: Record<string, string> = {
  bash: 'sh',
  css: 'css',
  html: 'html',
  javascript: 'js',
  js: 'js',
  json: 'json',
  jsx: 'jsx',
  markdown: 'md',
  md: 'md',
  shell: 'sh',
  sh: 'sh',
  svg: 'svg',
  ts: 'ts',
  tsx: 'tsx',
  typescript: 'ts',
  xml: 'xml',
  zsh: 'sh',
};

@Directive({
  selector: '[aiCodeBlockRoot],ai-code-block-root',
  exportAs: 'aiCodeBlockRoot',
  host: { '[class]': 'classes()', '[attr.data-language]': 'languageLabel()' },
})
export class CodeBlockRoot {
  /** Code string to render, copy, and download. */
  public readonly code = input.required<string>();
  /** Language identifier used for syntax highlighting and file extension detection. */
  public readonly language = input<string>('text');
  /** Additional classes merged onto the code block root element. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  private timer: ReturnType<typeof setTimeout> | undefined;
  private readonly destroyRef = inject(DestroyRef);
  public constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.timer));
  }

  private readonly document = inject(DOCUMENT);
  private readonly markdownOptions = inject(AI_MARKDOWN_OPTIONS);

  public readonly copied = signal(false);
  public readonly languageLabel = computed(() => this.language().trim().toLowerCase() || 'text');
  public readonly copyLabel = computed(() => (this.copied() ? 'Copied code' : 'Copy code'));

  public readonly highlightedCode = computed(() =>
    renderHighlightedCode(this.code(), this.languageLabel(), this.markdownOptions),
  );

  public readonly classes = computed(() =>
    twMerge(
      'ai-code-block my-4 flex w-full min-w-0 max-w-full flex-col gap-2 overflow-hidden rounded-xl border border-border bg-card p-2 text-foreground',
      this.userClass(),
    ),
  );

  public readonly bodyClasses = computed(() =>
    twMerge(
      'ai-code-block-body min-w-0 max-w-full overflow-hidden rounded-lg border border-border bg-background p-4 text-foreground',
      `language-${this.languageLabel()}`,
    ),
  );

  public readonly preClasses = computed(() => `language-${this.languageLabel()}`);

  public readonly codeClasses = computed(() => twMerge('hljs', `language-${this.languageLabel()}`));

  public async copy(): Promise<void> {
    if (!globalThis.navigator?.clipboard) return;
    await globalThis.navigator.clipboard.writeText(this.code());

    this.copied.set(true);
    clearTimeout(this.timer);
    this.timer = globalThis.setTimeout(() => this.copied.set(false), 1400);
  }

  public download(): void {
    const blob = new Blob([this.code()], { type: 'text/plain;charset=utf-8' });
    const url = globalThis.URL.createObjectURL(blob);
    const anchor = this.document.createElement('a');

    anchor.href = url;
    anchor.download = this.fileName();
    anchor.click();

    globalThis.URL.revokeObjectURL(url);
  }

  private fileName(): string {
    const extension = languageExtensions[this.languageLabel()] ?? 'txt';

    return `code.${extension}`;
  }
}
