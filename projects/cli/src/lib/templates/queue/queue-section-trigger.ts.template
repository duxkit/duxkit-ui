import { Component, computed, input } from '@angular/core';
import { BrnCollapsibleTrigger } from '@spartan-ng/brain/collapsible';
import { twMerge } from 'tailwind-merge';

@Component({
  selector: 'button[aiQueueSectionTrigger],ai-queue-section-trigger',
  hostDirectives: [{ directive: BrnCollapsibleTrigger, inputs: ['type'] }],
  host: {
    '[class]': 'classes()',
  },
  template: '<ng-content />',
})
export class QueueSectionTrigger {
  /** Additional classes merged onto the queue section trigger button. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() =>
    twMerge(
      'group flex w-full cursor-pointer items-center justify-between rounded-md bg-muted/40 px-3 py-2 text-left font-medium text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      this.userClass(),
    ),
  );
}
