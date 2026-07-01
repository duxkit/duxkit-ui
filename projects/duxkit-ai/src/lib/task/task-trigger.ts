import { Component, computed, inject, input } from '@angular/core';
import { BrnCollapsible, BrnCollapsibleTrigger } from '@spartan-ng/brain/collapsible';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown, lucideSearch } from '@ng-icons/lucide';
import { twMerge } from 'tailwind-merge';
import { Task } from './task';

@Component({
  selector: 'button[aiTaskTrigger],ai-task-trigger',
  imports: [NgIcon],
  providers: [provideIcons({ lucideChevronDown, lucideSearch })],
  hostDirectives: [{ directive: BrnCollapsibleTrigger, inputs: ['type'] }],
  host: {
    '[class]': 'classes()',
    '(click)': 'task.disableAutoToggle()',
  },
  template: `
    <ng-content>
      <ng-icon name="lucideSearch" style="--ng-icon__size: 16px" />
      <span class="min-w-0 truncate text-left">{{ triggerLabel() }}</span>
      <ng-icon
        name="lucideChevronDown"
        class="transition-transform"
        style="--ng-icon__size: 16px"
        [class.rotate-180]="expanded()"
      />
    </ng-content>
  `,
})
export class TaskTrigger {
  /** Additional classes merged onto the task trigger button. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly task = inject(Task);
  private readonly collapsible = inject(BrnCollapsible);

  protected readonly expanded = this.collapsible.expanded;
  protected readonly triggerLabel = computed(() => 'Task');
  protected readonly classes = computed(() =>
    twMerge(
      'group flex w-full cursor-pointer items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground',
      this.userClass(),
    ),
  );
}
