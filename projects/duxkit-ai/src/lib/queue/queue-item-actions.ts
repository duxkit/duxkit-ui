import { Directive, computed, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';

@Directive({
  selector: '[aiQueueItemActions],ai-queue-item-actions',
  host: {
    '[class]': 'classes()',
  },
})
export class QueueItemActions {
  /** Additional classes merged onto the queue item actions container. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() => twMerge('flex shrink-0 gap-1', this.userClass()));
}
