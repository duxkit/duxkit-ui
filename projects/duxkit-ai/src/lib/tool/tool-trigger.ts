import { Component, computed, inject, input } from '@angular/core';
import { BrnCollapsible, BrnCollapsibleTrigger } from '@spartan-ng/brain/collapsible';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown, lucideWrench } from '@ng-icons/lucide';
import { HlmIcon } from 'duxkit-ai/helm/icon';
import { twMerge } from 'tailwind-merge';
import { Tool } from './tool';
import { ToolStatus } from './tool-status';

@Component({
  selector: 'button[aiToolTrigger],ai-tool-trigger',
  imports: [HlmIcon, NgIcon, ToolStatus],
  providers: [provideIcons({ lucideChevronDown, lucideWrench })],
  hostDirectives: [{ directive: BrnCollapsibleTrigger, inputs: ['type'] }],
  host: {
    '[class]': 'classes()',
  },
  template: `
    <ng-content>
      <div class="flex justify-between w-full items-center gap-2">
        <div class="flex items-center gap-2">
          <ng-icon hlm size="sm" name="lucideWrench" />
          <span class="min-w-0 truncate font-medium">{{ tool.name() }}</span>
          <ai-tool-status></ai-tool-status>
        </div>
        <div class="flex items-center">
          <ng-icon hlm size="sm" name="lucideChevronDown" [class.rotate-180]="expanded()" />
        </div>
      </div>
    </ng-content>
  `,
})
export class ToolTrigger {
  protected readonly tool = inject(Tool);
  private readonly collapsible = inject(BrnCollapsible);

  readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly expanded = this.collapsible.expanded;
  protected readonly classes = computed(() =>
    twMerge(
      'flex min-h-9 w-full items-center gap-2 px-3 py-2 text-left text-muted-foreground text-sm transition-colors hover:text-foreground',
      this.userClass(),
    ),
  );
}
