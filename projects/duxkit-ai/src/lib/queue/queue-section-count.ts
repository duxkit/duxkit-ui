import { Component, computed, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';

@Component({
  selector: '[aiQueueSectionCount],ai-queue-section-count',
  host: { '[class]': 'classes()' },
  template: '<ng-content />',
})
export class QueueSectionCount {
  /** Additional classes merged onto the queue section count. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });
  protected readonly classes = computed(() => twMerge('tabular-nums', this.userClass()));
}
