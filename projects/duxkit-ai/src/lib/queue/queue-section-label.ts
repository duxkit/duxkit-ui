import { Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown } from '@ng-icons/lucide';
import { twMerge } from 'tailwind-merge';

@Component({
  selector: '[aiQueueSectionLabel],ai-queue-section-label',
  imports: [NgIcon],
  providers: [provideIcons({ lucideChevronDown })],
  host: {
    '[class]': 'classes()',
  },
  template: `
    <ng-icon
      name="lucideChevronDown"
      class="shrink-0 transition-transform group-data-[state=closed]:-rotate-90"
      style="--ng-icon__size: 16px"
      aria-hidden="true"
    />
    <ng-content />
  `,
})
export class QueueSectionLabel {
  /** Additional classes merged onto the queue section label. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() =>
    twMerge('flex min-w-0 items-center gap-2', this.userClass()),
  );
}
