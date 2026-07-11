import { Component, computed, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';

@Component({
  selector: '[aiQueueItemDescription],ai-queue-item-description',
  host: {
    '[class]': 'classes()',
  },
  template: '<ng-content />',
})
export class QueueItemDescription {
  /** Whether the queue item description should render as completed. */
  public readonly completed = input(false);
  /** Additional classes merged onto the queue item description. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() =>
    twMerge(
      'ml-6 text-xs',
      this.completed() ? 'text-muted-foreground/40 line-through' : 'text-muted-foreground',
      this.userClass(),
    ),
  );
}
