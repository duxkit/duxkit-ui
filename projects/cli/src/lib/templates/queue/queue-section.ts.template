import { computed, Directive, inject, input } from '@angular/core';
import { BrnCollapsible } from '@spartan-ng/brain/collapsible';
import { twMerge } from 'tailwind-merge';

@Directive({
  selector: '[aiQueueSection],ai-queue-section',
  hostDirectives: [
    {
      directive: BrnCollapsible,
      inputs: ['expanded', 'disabled'],
      outputs: ['expandedChange'],
    },
  ],
  host: {
    '[class]': 'classes()',
  },
})
export class QueueSection {
  /** Additional classes merged onto the collapsible queue section. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  private readonly collapsible = inject(BrnCollapsible);

  protected readonly classes = computed(() => twMerge('block min-w-0', this.userClass()));

  constructor() {
    this.collapsible.expanded.set(true);
  }
}
