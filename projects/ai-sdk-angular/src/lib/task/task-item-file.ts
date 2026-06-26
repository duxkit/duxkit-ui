import { Component, computed, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';

@Component({
  selector: '[aiTaskItemFile],ai-task-item-file',
  host: {
    '[class]': 'classes()',
  },
  template: '<ng-content />',
})
export class TaskItemFile {
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() =>
    twMerge(
      'inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-1.5 py-0.5 text-foreground text-xs',
      this.userClass(),
    ),
  );
}
