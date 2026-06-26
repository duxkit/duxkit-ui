import { Component, computed, inject, input } from '@angular/core';
import { BrnCollapsibleContent } from '@spartan-ng/brain/collapsible';
import { twMerge } from 'tailwind-merge';
import { Tool } from './tool';

@Component({
  selector: '[aiToolContent],ai-tool-content',
  hostDirectives: [{ directive: BrnCollapsibleContent, inputs: ['id'] }],
  host: {
    '[class]': 'classes()',
  },
  template: `
    <ng-content>
      <pre class="m-0 max-w-full overflow-auto p-3 text-xs leading-relaxed">{{ tool.json() }}</pre>
    </ng-content>
  `,
})
export class ToolContent {
  protected readonly tool = inject(Tool);
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() =>
    twMerge(
      'border-t border-border bg-muted/30 text-foreground outline-none data-[state=closed]:hidden',
      this.userClass(),
    ),
  );
}
