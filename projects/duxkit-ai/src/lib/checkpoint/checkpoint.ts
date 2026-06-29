import { Component, computed, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';

export const checkpointClasses =
  'flex min-w-0 items-center gap-0.5 overflow-hidden text-muted-foreground';

@Component({
  selector: 'ai-checkpoint,[aiCheckpoint]',
  host: {
    '[class]': 'classes()',
  },
  template: `
    <ng-content />
    <span
      data-ai-checkpoint-separator
      aria-hidden="true"
      class="ml-2 min-w-4 flex-1 border-0 border-t border-solid border-border bg-border"
    ></span>
  `,
})
export class Checkpoint {
  /** Additional classes merged onto the checkpoint row. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() => twMerge(checkpointClasses, this.userClass()));
}
