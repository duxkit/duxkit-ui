import { Component, computed, input } from '@angular/core';
import { BrnCollapsibleContent } from '@spartan-ng/brain/collapsible';
import { twMerge } from 'tailwind-merge';

@Component({
  selector: '[aiTaskContent],ai-task-content',
  hostDirectives: [{ directive: BrnCollapsibleContent, inputs: ['id'] }],
  host: {
    '[class]': 'classes()',
  },
  template: `
    <div class="mt-4 space-y-2 border-l-2 border-l-border pl-4">
      <ng-content />
    </div>
  `,
})
export class TaskContent {
  /** Additional classes merged onto the collapsible task content region. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() =>
    twMerge(
      'text-popover-foreground outline-none data-[state=closed]:hidden data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 data-[state=closed]:animate-out data-[state=open]:animate-in',
      this.userClass(),
    ),
  );
}
