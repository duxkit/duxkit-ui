import { Component, computed, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';

@Component({
  selector: '[aiQueueList],ai-queue-list',
  host: {
    '[class]': 'classes()',
    '[attr.role]': 'role()',
  },
  template: '<ng-content />',
})
export class QueueList {
  /** ARIA role applied to non-list queue containers. */
  public readonly role = input<string | null>('list');
  /** Additional classes merged onto the scrollable queue list. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() =>
    twMerge('mt-2 -mb-1 block max-h-40 overflow-y-auto pr-4', this.userClass()),
  );
}
