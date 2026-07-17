import { DOCUMENT } from '@angular/common';
import { Component, computed, inject, input, signal, ViewEncapsulation } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideCopy, lucideDownload } from '@ng-icons/lucide';
import { twMerge } from 'tailwind-merge';
import { AI_MARKDOWN_OPTIONS, renderHighlightedCode } from 'duxkit-ai/markdown';

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

@Component({
  selector: 'ai-code-block',
  imports: [NgIcon],
  providers: [provideIcons({ lucideCheck, lucideCopy, lucideDownload })],
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
    '[attr.data-language]': 'languageLabel()',
    'data-streamdown': 'code-block',
    '[style.content-visibility]': '"auto"',
    '[style.contain-intrinsic-size]': '"auto 200px"',
  },
  styleUrl: '../markdown.scss',
  template: `
    <div
      class="ai-code-block-header flex h-8 items-center justify-between gap-2 text-muted-foreground text-xs"
      [attr.data-language]="languageLabel()"
      data-streamdown="code-block-header"
    >
      <span class="ai-code-block-language ml-1 font-mono lowercase">{{ languageLabel() }}</span>

      <div class="ai-code-block-actions" role="group" aria-label="Code block actions">
        <button
          type="button"
          class="ai-code-block-action inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-0 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Download file"
          aria-label="Download code"
          (click)="download()"
        >
          <ng-icon name="lucideDownload" style="--ng-icon__size: 16px" />
        </button>
        <button
          type="button"
          class="ai-code-block-action inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-0 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          [title]="copyLabel()"
          [attr.aria-label]="copyLabel()"
          (click)="copy()"
        >
          <ng-icon [name]="copied() ? 'lucideCheck' : 'lucideCopy'" style="--ng-icon__size: 16px" />
        </button>
      </div>
    </div>

    <div
      [class]="bodyClasses()"
      [attr.data-language]="languageLabel()"
      data-streamdown="code-block-body"
    >
      <pre
        [class]="preClasses()"
      ><code [class]="codeClasses()" [innerHTML]="highlightedCode()"></code></pre>
    </div>
  `,
})
export class CodeBlock {
  /** Code string to render, copy, and download. */
  public readonly code = input.required<string>();
  /** Language identifier used for syntax highlighting and file extension detection. */
  public readonly language = input<string>('text');
  /** Additional classes merged onto the code block root element. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  private readonly document = inject(DOCUMENT);
  private readonly markdownOptions = inject(AI_MARKDOWN_OPTIONS);

  protected readonly copied = signal(false);
  protected readonly languageLabel = computed(() => this.language().trim().toLowerCase() || 'text');
  protected readonly copyLabel = computed(() => (this.copied() ? 'Copied code' : 'Copy code'));

  protected readonly highlightedCode = computed(() =>
    renderHighlightedCode(this.code(), this.languageLabel(), this.markdownOptions),
  );

  protected readonly classes = computed(() =>
    twMerge(
      'ai-code-block my-4 flex w-full min-w-0 max-w-full flex-col gap-2 overflow-hidden rounded-xl border border-border bg-card p-2 text-foreground',
      this.userClass(),
    ),
  );

  protected readonly bodyClasses = computed(() =>
    twMerge(
      'ai-code-block-body min-w-0 max-w-full overflow-hidden rounded-lg border border-border bg-background p-4 text-foreground',
      `language-${this.languageLabel()}`,
    ),
  );

  protected readonly preClasses = computed(() => `language-${this.languageLabel()}`);

  protected readonly codeClasses = computed(() =>
    twMerge('hljs', `language-${this.languageLabel()}`),
  );

  protected async copy(): Promise<void> {
    await globalThis.navigator?.clipboard?.writeText(this.code());

    this.copied.set(true);
    globalThis.setTimeout(() => this.copied.set(false), 1400);
  }

  protected download(): void {
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
