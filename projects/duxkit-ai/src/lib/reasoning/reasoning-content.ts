import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, TemplateRef, ViewEncapsulation } from '@angular/core';
import { BrnCollapsibleContent } from '@spartan-ng/brain/collapsible';
import { CodeBlock } from 'duxkit-ai/code-block';
import type { MarkdownCodeContext } from 'duxkit-ai/markdown';
import {
  AI_MARKDOWN_OPTIONS,
  parseMarkdownBlocks,
  reasoningMarkdownContentClasses,
} from 'duxkit-ai/markdown';
import { twMerge } from 'tailwind-merge';
import { ContentClamp } from './content-clamp';

@Component({
  exportAs: 'aiReasoningContent',
  selector: '[aiReasoningContent],ai-reasoning-content',
  imports: [CodeBlock, NgTemplateOutlet],
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
        [style.mask-image]="contentMaskImage()"
        [style.-webkit-mask-image]="contentMaskImage()"
      >
        @if (markdown() !== undefined) {
          <div [class]="markdownClasses">
            @for (block of markdownBlocks(); track block.id) {
              @if (block.type === 'html') {
                <div [innerHTML]="block.html"></div>
              } @else {
                @if (codeTemplate(); as renderer) {
                  <ng-container
                    [ngTemplateOutlet]="renderer"
                    [ngTemplateOutletContext]="{ $implicit: block }"
                  />
                } @else {
                  <ai-code-block [code]="block.code" [language]="block.language" />
                }
              }
            }
          </div>
        } @else {
          <ng-content />
        }
      </div>

      @if (showControls() && showClampOverlay()) {
        <div class="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pt-12 pb-1">
          <button
            type="button"
            class="pointer-events-auto rounded-md border border-border bg-background/90 px-2.5 py-1 font-medium text-muted-foreground text-xs shadow-sm transition-colors hover:text-foreground"
            (click)="expandContent()"
          >
            {{ showMoreLabel() }}
          </button>
        </div>
      }

      @if (showControls() && showCollapseControl()) {
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
export class ReasoningContent extends ContentClamp {
  /** Replace code fences while retaining markdown parsing. Template receives the block as $implicit. */
  public readonly codeTemplate = input<TemplateRef<MarkdownCodeContext>>();
  /** Markdown source rendered with the configured code-fence template. */
  public readonly markdown = input<string | undefined>();
  /** Accessible label for the control that expands clipped reasoning content. */
  public readonly showMoreLabel = input('Show more');
  /** Accessible label for the control that collapses clipped reasoning content. */
  public readonly showLessLabel = input('Show less');
  /** Additional classes merged onto the reasoning content element. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });
  protected readonly markdownClasses = reasoningMarkdownContentClasses;
  private readonly markdownOptions = inject(AI_MARKDOWN_OPTIONS);
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
