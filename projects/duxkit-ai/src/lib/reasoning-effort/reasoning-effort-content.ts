import { OverlayModule } from '@angular/cdk/overlay';
import { Component, computed, input } from '@angular/core';
import { BrnPopoverContent } from '@spartan-ng/brain/popover';
import { twMerge } from 'tailwind-merge';
import { injectReasoningEffort } from './reasoning-effort-root';

export const reasoningEffortContentClasses =
  'bg-popover text-popover-foreground w-[min(90vw,28rem)] rounded-lg border border-border p-4 shadow-md outline-none';

@Component({
  selector: 'ai-reasoning-effort-content,[aiReasoningEffortContent]',
  imports: [OverlayModule, BrnPopoverContent],
  host: {
    '[class]': 'hostClasses()',
  },
  template: `
    <ng-template brnPopoverContent>
      <div
        role="dialog"
        data-slot="reasoning-effort-content"
        [attr.aria-label]="ariaLabel() ?? reasoningEffort.label()"
        [class]="panelClasses()"
      >
        <ng-content />
      </div>
    </ng-template>
  `,
})
export class ReasoningEffortContent {
  protected readonly reasoningEffort = injectReasoningEffort();

  /** Accessible name for the popover surface. Defaults to the root label. */
  public readonly ariaLabel = input<string | undefined>(undefined);
  /** Additional classes merged onto the popover surface. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly hostClasses = computed(() => twMerge('contents', this.userClass()));
  protected readonly panelClasses = computed(() =>
    twMerge(reasoningEffortContentClasses, this.userClass()),
  );
}
