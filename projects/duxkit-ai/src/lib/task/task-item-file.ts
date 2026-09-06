import { Directive, computed, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';

@Directive({
  selector: '[aiTaskItemFile],ai-task-item-file',
  host: {
    '[class]': 'classes()',
  },
})
export class TaskItemFile {
  /** Additional classes merged onto the highlighted task file element. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() =>
    twMerge(
      'inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-1.5 py-0.5 text-foreground text-xs',
      this.userClass(),
    ),
  );
}
