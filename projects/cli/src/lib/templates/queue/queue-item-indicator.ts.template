import { Component, computed, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';

@Component({
  selector: '[aiQueueItemIndicator],ai-queue-item-indicator',
  host: {
    '[class]': 'classes()',
    'aria-hidden': 'true',
  },
  template: '',
})
export class QueueItemIndicator {
  /** Whether the item represented by this indicator is complete. */
  public readonly completed = input(false);
  /** Additional classes merged onto the queue item indicator. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() =>
    twMerge(
      'mt-0.5 inline-block size-2.5 shrink-0 rounded-full border',
      this.completed()
        ? 'border-muted-foreground/20 bg-muted-foreground/10'
        : 'border-muted-foreground/50',
      this.userClass(),
    ),
  );
}
