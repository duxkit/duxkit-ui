import { Component, computed, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';

@Component({
  selector: '[aiQueueItemActions],ai-queue-item-actions',
  host: {
    '[class]': 'classes()',
  },
  template: '<ng-content />',
})
export class QueueItemActions {
  /** Additional classes merged onto the queue item actions container. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() => twMerge('flex shrink-0 gap-1', this.userClass()));
}
