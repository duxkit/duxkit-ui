import { Component, computed, input, viewChild } from '@angular/core';
import { BrnHoverCardContent } from '@spartan-ng/brain/hover-card';
import { twMerge } from 'tailwind-merge';

export const contextContentClasses =
  'z-50 min-w-72 divide-y overflow-hidden rounded-lg border border-border bg-popover p-0 text-popover-foreground shadow-md outline-none';

@Component({
  selector: 'ai-context-content,[aiContextContent]',
  imports: [BrnHoverCardContent],
  host: {
    '[class]': 'hostClasses()',
  },
  template: `
    <ng-template #hoverCardContent="brnHoverCardContent" brnHoverCardContent>
      <div [class]="panelClasses()">
        <ng-content />
      </div>
    </ng-template>
  `,
})
export class ContextContent {
  /** Additional classes merged onto the context content panel. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  public readonly hoverCardContent = viewChild(BrnHoverCardContent);

  protected readonly hostClasses = computed(() => twMerge('min-w-72', this.userClass()));
  protected readonly panelClasses = computed(() =>
    twMerge(contextContentClasses, this.userClass()),
  );
}
