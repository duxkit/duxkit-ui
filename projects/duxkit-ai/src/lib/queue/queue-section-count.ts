import { Directive, computed, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';

@Directive({
  selector: '[aiQueueSectionCount],ai-queue-section-count',
  host: { '[class]': 'classes()' },
})
export class QueueSectionCount {
  /** Additional classes merged onto the queue section count. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });
  protected readonly classes = computed(() => twMerge('tabular-nums', this.userClass()));
}
