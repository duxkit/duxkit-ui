import { computed, Directive, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';

@Directive({
  selector: 'ai-conversation,[aiConversation]',
  host: {
    '[class]': 'classes()',
  },
})
export class Conversation {
  /** Controls whether the conversation content scrolls to the latest message. */
  public readonly stickToBottom = input<'auto' | boolean>('auto');
  /** Additional classes merged onto the conversation root element. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });
  protected readonly classes = computed(() =>
    twMerge('w-full h-full flex flex-col mb-2', this.userClass()),
  );
}
