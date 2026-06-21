import { Component, computed, inject, input, ViewEncapsulation } from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  AI_MARKDOWN_OPTIONS,
  markdownContentClasses,
  markdownStyles,
  renderMarkdown,
} from '../markdown';
import { Message } from './message';

export const messageContentVariants = cva(
  'block w-fit max-w-[80%] min-w-0 overflow-hidden rounded-lg text-sm',
  {
    variants: {
      from: {
        user: 'ml-auto bg-muted text-foreground px-3 py-2',
        assistant: 'mr-auto text-foreground py-2',
        system: 'mx-auto bg-transparent text-muted-foreground text-xs px-3 py-2',
      },
    },
    defaultVariants: {
      from: 'assistant',
    },
  },
);

export type MessageContentVariants = VariantProps<typeof messageContentVariants>;

@Component({
  selector: 'ai-message-content,[aiMessageContent]',
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': '_classes()',
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
export class MessageContent {
  public readonly markdown = input<string | undefined>();
  public readonly userClass = input<string | undefined>(undefined, {
    alias: 'class',
  });
  protected readonly markdownClasses = markdownContentClasses;

  private readonly message = inject(Message);
  private readonly markdownOptions = inject(AI_MARKDOWN_OPTIONS);
  private readonly _from = computed(() => this.message.from());

  protected readonly renderedMarkdown = computed(() => {
    const markdown = this.markdown();

    if (markdown === undefined) {
      return '';
    }

    return renderMarkdown(markdown, this.markdownOptions);
  });

  public readonly _classes = computed(() => {
    return twMerge(
      clsx(
        messageContentVariants({
          from: this._from(),
        }),
        this.userClass(),
      ),
    );
  });
}
