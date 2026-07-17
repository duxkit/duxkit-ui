import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CodeBlock } from 'duxkit-ai/code-block';
import {
  AI_MARKDOWN_OPTIONS,
  markdownContentClasses,
  parseMarkdownBlocks,
} from 'duxkit-ai/markdown';
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
  imports: [CodeBlock],
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': '_classes()',
  },
  styleUrl: '../markdown.scss',
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
export class MessageContent {
  /** Markdown source rendered as rich message content. */
  public readonly markdown = input<string | undefined>();
  /** Additional classes merged onto the message content element. */
  public readonly userClass = input<string | undefined>(undefined, {
    alias: 'class',
  });
  protected readonly markdownClasses = markdownContentClasses;

  private readonly message = inject(Message);
  private readonly markdownOptions = inject(AI_MARKDOWN_OPTIONS);
  private readonly destroyRef = inject(DestroyRef);
  private readonly copyTextEntryId = this.message.registerCopyText();
  private readonly _from = computed(() => this.message.from());

  constructor() {
    effect(() => {
      this.message.updateCopyText(this.copyTextEntryId, this.markdown());
    });

    this.destroyRef.onDestroy(() => {
      this.message.unregisterCopyText(this.copyTextEntryId);
    });
  }

  protected readonly markdownBlocks = computed(() => {
    const markdown = this.markdown();

    if (markdown === undefined) {
      return [];
    }

    return parseMarkdownBlocks(markdown, this.markdownOptions);
  });

  public readonly _classes = computed(() => {
    return twMerge(
      clsx(
        messageContentVariants({
          from: this._from(),
        }),
        this.markdown() !== undefined && 'w-full',
        this.userClass(),
      ),
    );
  });
}
