import { Component, computed, inject, input, ViewEncapsulation } from '@angular/core';
import { BrnCollapsibleContent } from '@spartan-ng/brain/collapsible';
import { twMerge } from 'tailwind-merge';
import {
  AI_MARKDOWN_OPTIONS,
  markdownStyles,
  reasoningMarkdownContentClasses,
  renderMarkdown,
} from '../markdown';

@Component({
  selector: '[aiReasoningContent],ai-reasoning-content',
  encapsulation: ViewEncapsulation.None,
  hostDirectives: [{ directive: BrnCollapsibleContent, inputs: ['id'] }],
  host: {
    '[class]': 'classes()',
  },
  styles: [markdownStyles],
  template: `
    @if (markdown() !== undefined) {
      <div [class]="markdownClasses" [innerHTML]="renderedMarkdown()"></div>
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

  protected readonly renderedMarkdown = computed(() => {
    const markdown = this.markdown();

    if (markdown === undefined) {
      return '';
    }

    return renderMarkdown(markdown, this.markdownOptions);
  });

  protected readonly classes = computed(() =>
    twMerge(
      'mt-4 text-sm leading-relaxed text-muted-foreground outline-none data-[state=closed]:hidden',
      this.userClass(),
    ),
  );
}
