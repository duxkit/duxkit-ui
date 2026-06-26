import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { BrnCollapsibleContent } from '@spartan-ng/brain/collapsible';
import { twMerge } from 'tailwind-merge';
import {
  AI_MARKDOWN_OPTIONS,
  parseMarkdownBlocks,
  reasoningMarkdownContentClasses,
} from '../markdown';
import { CodeBlock } from '../code-block';

@Component({
  selector: '[aiReasoningContent],ai-reasoning-content',
  imports: [CodeBlock],
  encapsulation: ViewEncapsulation.None,
  hostDirectives: [{ directive: BrnCollapsibleContent, inputs: ['id'] }],
  host: {
    '[class]': 'classes()',
  },
  styleUrl: '../markdown.scss',
  template: `
    <div class="relative min-w-0">
      <div
        #clampedContent
        class="min-w-0"
        [class.overflow-hidden]="isClamped()"
        [style.max-height]="contentMaxHeight()"
      >
        @if (markdown() !== undefined) {
          <div [class]="markdownClasses">
            @for (block of markdownBlocks(); track block.id) {
              @if (block.type === 'html') {
                <div [innerHTML]="block.html"></div>
              } @else {
                <ai-code-block [code]="block.code" [language]="block.language" />
              }
            }
          </div>
        } @else {
          <ng-content />
        }
      </div>

      @if (showClampOverlay()) {
        <div
          class="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-background via-background/80 to-transparent pt-12 pb-1"
        >
          <button
            type="button"
            class="pointer-events-auto rounded-md border border-border bg-background/90 px-2.5 py-1 font-medium text-muted-foreground text-xs shadow-sm transition-colors hover:text-foreground"
            (click)="expandContent()"
          >
            {{ showMoreLabel() }}
          </button>
        </div>
      }

      @if (showCollapseControl()) {
        <div class="mt-2 flex justify-center">
          <button
            type="button"
            class="rounded-md border border-border bg-background/90 px-2.5 py-1 font-medium text-muted-foreground text-xs shadow-sm transition-colors hover:text-foreground"
            (click)="collapseContent()"
          >
            {{ showLessLabel() }}
          </button>
        </div>
      }
    </div>
  `,
})
export class ReasoningContent implements AfterViewInit, OnDestroy {
  public readonly markdown = input<string | undefined>();
  public readonly collapsedMaxHeight = input<number | string | undefined>();
  public readonly pinToBottom = input(false);
  public readonly showMoreLabel = input('Show more');
  public readonly showLessLabel = input('Show less');
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });
  protected readonly markdownClasses = reasoningMarkdownContentClasses;
  private readonly markdownOptions = inject(AI_MARKDOWN_OPTIONS);
  private readonly clampedContent = viewChild<ElementRef<HTMLElement>>('clampedContent');
  private resizeObserver: ResizeObserver | undefined;
  private mutationObserver: MutationObserver | undefined;

  protected readonly expanded = signal(false);
  protected readonly hasOverflow = signal(false);
  protected readonly isClamped = computed(
    () => this.collapsedMaxHeight() !== undefined && !this.expanded(),
  );
  protected readonly showClampOverlay = computed(() => this.isClamped() && this.hasOverflow());
  protected readonly showCollapseControl = computed(
    () => this.collapsedMaxHeight() !== undefined && this.expanded() && this.hasOverflow(),
  );
  protected readonly contentMaxHeight = computed(() => {
    if (!this.isClamped()) {
      return null;
    }

    return this.formatMaxHeight(this.collapsedMaxHeight());
  });

  constructor() {
    effect(() => {
      this.collapsedMaxHeight();
      this.expanded();
      this.pinToBottom();
      this.markdownBlocks();

      queueMicrotask(() => this.syncClampState());
    });
  }

  ngAfterViewInit(): void {
    const content = this.clampedContent()?.nativeElement;

    if (content === undefined) {
      return;
    }

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.syncClampState());
      this.resizeObserver.observe(content);
    }

    if (typeof MutationObserver !== 'undefined') {
      this.mutationObserver = new MutationObserver(() => this.syncClampState());
      this.mutationObserver.observe(content, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    }

    queueMicrotask(() => this.syncClampState());
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.mutationObserver?.disconnect();
  }

  protected expandContent(): void {
    this.expanded.set(true);
  }

  protected collapseContent(): void {
    this.expanded.set(false);
  }

  private syncClampState(): void {
    const content = this.clampedContent()?.nativeElement;

    if (content === undefined || this.collapsedMaxHeight() === undefined) {
      this.hasOverflow.set(false);
      return;
    }

    const maxHeight = Number.parseFloat(this.formatMaxHeight(this.collapsedMaxHeight()) ?? '0');

    if (this.expanded()) {
      this.hasOverflow.set(content.scrollHeight > maxHeight + 1);
      return;
    }

    this.hasOverflow.set(content.scrollHeight > content.clientHeight + 1);

    if (this.pinToBottom() && this.isClamped()) {
      content.scrollTop = content.scrollHeight;
    }
  }

  private formatMaxHeight(value: number | string | undefined): string | null {
    if (value === undefined) {
      return null;
    }

    return typeof value === 'number' ? `${value}px` : value;
  }

  protected readonly markdownBlocks = computed(() => {
    const markdown = this.markdown();

    if (markdown === undefined) {
      return [];
    }

    return parseMarkdownBlocks(markdown, this.markdownOptions);
  });

  protected readonly classes = computed(() =>
    twMerge(
      'mt-4 text-sm leading-relaxed text-muted-foreground outline-none data-[state=closed]:hidden',
      this.userClass(),
    ),
  );
}
