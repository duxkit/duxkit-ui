import { computed, Directive, inject, input } from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Message } from './message';

export const messageContentVariants = cva(
  'block w-fit max-w-[80%] rounded-lg px-3 py-2 text-sm',
  {
    variants: {
      from: {
        user: 'ml-auto bg-primary text-primary-foreground',
        assistant: 'mr-auto bg-muted text-foreground',
        system: 'mx-auto bg-transparent text-muted-foreground text-xs',
      },
    },
    defaultVariants: {
      from: 'assistant',
    },
  },
);

export type MessageContentVariants = VariantProps<typeof messageContentVariants>;

@Directive({
  selector: 'ai-message-content,[aiMessageContent]',
  host: {
    '[class]': '_classes()',
  },
})
export class MessageContent {
  public readonly userClass = input<string | undefined>(undefined, {
    alias: 'class',
  });

  private readonly message = inject(Message);
  private readonly _from = computed(() => this.message.from());

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
