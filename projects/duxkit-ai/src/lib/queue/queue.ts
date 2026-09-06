import { Directive, computed, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';

@Directive({
  selector: '[aiQueue],ai-queue',
  host: {
    '[class]': 'classes()',
  },
})
export class Queue {
  /** Additional classes merged onto the queue root element. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() =>
    twMerge(
      'flex flex-col gap-2 rounded-lg border border-border bg-background px-2 pt-2 pb-2 shadow-xs',
      this.userClass(),
    ),
  );
}
