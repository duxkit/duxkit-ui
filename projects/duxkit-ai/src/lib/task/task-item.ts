import { Component, computed, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';

@Component({
  selector: '[aiTaskItem],ai-task-item',
  host: {
    '[class]': 'classes()',
  },
  template: '<ng-content />',
})
export class TaskItem {
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() =>
    twMerge('block text-muted-foreground text-sm', this.userClass()),
  );
}
