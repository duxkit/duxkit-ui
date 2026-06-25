import { Component, computed, inject, input, ViewEncapsulation } from '@angular/core';
import { BrnCollapsibleContent } from '@spartan-ng/brain/collapsible';
import { twMerge } from 'tailwind-merge';
import {
  AI_MARKDOWN_OPTIONS,
  markdownStyles,
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
  styles: [markdownStyles],
  template: `
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
  `,
})
export class ReasoningContent {
  public readonly markdown = input<string | undefined>();
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
