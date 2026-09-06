import { Component, computed, Directive, inject, input, ViewEncapsulation } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideCopy, lucideDownload } from '@ng-icons/lucide';
import { twMerge } from 'tailwind-merge';
import { CodeBlockRoot } from './code-block-root';

@Directive({
  selector: '[aiCodeBlockHeader],ai-code-block-header',
  host: { '[class]': 'classes()', 'data-streamdown': 'code-block-header' },
})
export class CodeBlockHeader {
  /** Additional header classes. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });
  protected readonly classes = computed(() =>
    twMerge(
      'ai-code-block-header flex h-8 items-center justify-between gap-2 text-muted-foreground text-xs',
      this.userClass(),
    ),
  );
}
@Directive({
  selector: '[aiCodeBlockActions],ai-code-block-actions',
  host: { '[class]': 'classes()', role: 'group', 'aria-label': 'Code block actions' },
})
export class CodeBlockActions {
  /** Additional action group classes. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });
  protected readonly classes = computed(() =>
    twMerge('ai-code-block-actions flex items-center gap-1', this.userClass()),
  );
}
@Component({
  selector: '[aiCodeBlockLanguage],ai-code-block-language',
  host: { '[class]': 'classes()' },
  template: '<ng-content>{{ root.languageLabel() }}</ng-content>',
})
export class CodeBlockLanguage {
  public readonly root = inject(CodeBlockRoot);
  /** Additional language label classes. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });
  protected readonly classes = computed(() =>
    twMerge('ai-code-block-language ml-1 font-mono lowercase', this.userClass()),
  );
}
@Component({
  selector: '[aiCodeBlockContent],ai-code-block-content',
  encapsulation: ViewEncapsulation.None,
  styleUrl: '../markdown.scss',
  host: { '[class]': 'classes()', 'data-streamdown': 'code-block-body' },
  template:
    '<pre [class]="root.preClasses()"><code [class]="root.codeClasses()" [innerHTML]="root.highlightedCode()"></code></pre>',
})
export class CodeBlockContent {
  public readonly root = inject(CodeBlockRoot);
  /** Additional highlighted body classes. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });
  protected readonly classes = computed(() => twMerge(this.root.bodyClasses(), this.userClass()));
}
const actionClasses =
  'ai-code-block-action inline-flex min-h-6 min-w-6 w-fit cursor-pointer items-center justify-center rounded-md border-0 bg-transparent px-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';
@Component({
  selector: 'button[aiCodeBlockCopy]',
  imports: [NgIcon],
  providers: [provideIcons({ lucideCheck, lucideCopy })],
  host: {
    type: 'button',
    '[class]': 'classes()',
    '[attr.aria-label]': 'root.copyLabel()',
    '(click)': 'root.copy()',
  },
  template: `<ng-content
    ><ng-icon [name]="root.copied() ? 'lucideCheck' : 'lucideCopy'" aria-hidden="true"
  /></ng-content>`,
})
export class CodeBlockCopy {
  public readonly root = inject(CodeBlockRoot);
  /** Additional copy control classes. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });
  protected readonly classes = computed(() => twMerge(actionClasses, this.userClass()));
}
@Component({
  selector: 'button[aiCodeBlockDownload]',
  imports: [NgIcon],
  providers: [provideIcons({ lucideDownload })],
  host: {
    type: 'button',
    '[class]': 'classes()',
    'aria-label': 'Download code',
    '(click)': 'root.download()',
  },
  template: '<ng-content><ng-icon name="lucideDownload" aria-hidden="true" /></ng-content>',
})
export class CodeBlockDownload {
  public readonly root = inject(CodeBlockRoot);
  /** Additional download control classes. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });
  protected readonly classes = computed(() => twMerge(actionClasses, this.userClass()));
}
