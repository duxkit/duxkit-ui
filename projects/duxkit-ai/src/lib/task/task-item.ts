import { Directive, computed, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';

@Directive({
  selector: '[aiTaskItem],ai-task-item',
  host: {
    '[class]': 'classes()',
  },
})
export class TaskItem {
  /** Additional classes merged onto the task item element. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() =>
    twMerge('block text-muted-foreground text-sm', this.userClass()),
  );
}
