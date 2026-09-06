import { Directive, computed, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';

@Directive({
  selector: '[aiQueueItemContent],ai-queue-item-content',
  host: {
    '[class]': 'classes()',
  },
})
export class QueueItemContent {
  /** Whether the queue item content should render as completed. */
  public readonly completed = input(false);
  /** Additional classes merged onto the queue item content. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() =>
    twMerge(
      'min-w-0 grow truncate',
      this.completed() ? 'text-muted-foreground line-through' : 'text-muted-foreground',
      this.userClass(),
    ),
  );
}
