import { Directive, computed, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';

@Directive({
  selector: 'li[aiQueueItem],ai-queue-item',
  host: {
    '[class]': 'classes()',
    '[attr.role]': 'role()',
  },
})
export class QueueItem {
  /** ARIA role applied when the queue item is rendered as a custom element. */
  public readonly role = input<string | null>('listitem');
  /** Additional classes merged onto the queue item. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() =>
    twMerge(
      'group flex flex-col rounded-md px-3 py-1 text-sm transition-colors hover:bg-muted',
      this.userClass(),
    ),
  );
}
