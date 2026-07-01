import { computed, Directive, inject, input } from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { Message } from './message';

export const messageActionsVariants = cva(
  'mt-2 flex w-fit items-center gap-1 text-muted-foreground',
  {
    variants: {
      from: {
        user: 'ml-auto',
        assistant: 'mr-auto',
        system: 'mx-auto',
      },
    },
    defaultVariants: {
      from: 'assistant',
    },
  },
);

export type MessageActionsVariants = VariantProps<typeof messageActionsVariants>;

@Directive({
  selector: 'ai-message-actions,[aiMessageActions]',
  host: {
    'aria-label': 'Message actions',
    role: 'group',
    '[class]': 'classes()',
  },
})
export class MessageActions {
  /** Additional classes merged onto the message actions group. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  private readonly message = inject(Message);

  protected readonly classes = computed(() =>
    twMerge(
      messageActionsVariants({
        from: this.message.from(),
      }),
      this.userClass(),
    ),
  );
}
