import { Directive, computed, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';

export type QueueItemActionType = 'button' | 'submit' | 'reset';

@Directive({
  selector: 'button[aiQueueItemAction],button[ai-queue-item-action]',
  host: {
    '[class]': 'classes()',
    '[attr.type]': 'type()',
  },
})
export class QueueItemAction {
  /** Native button type for the queue item action. */
  public readonly type = input<QueueItemActionType>('button');
  /** Additional classes merged onto the queue item action button. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() =>
    twMerge(
      'shrink-0 opacity-0 focus-visible:opacity-100 group-hover:opacity-100',
      this.userClass(),
    ),
  );
}
