import { Component, computed, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';

@Component({
  selector: '[aiQueueItemAttachment],ai-queue-item-attachment',
  host: {
    '[class]': 'classes()',
  },
  template: '<ng-content />',
})
export class QueueItemAttachment {
  /** Additional classes merged onto the queue item attachment container. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() =>
    twMerge('mt-1 flex flex-wrap gap-2', this.userClass()),
  );
}
