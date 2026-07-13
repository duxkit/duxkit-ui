import { Component, computed, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';
import { ReasoningEffortItem } from './reasoning-effort-item';
import { injectReasoningEffort } from './reasoning-effort-root';

@Component({
  selector: 'ai-reasoning-effort-list,[aiReasoningEffortList]',
  imports: [ReasoningEffortItem],
  host: {
    role: 'group',
    'data-slot': 'reasoning-effort-list',
    '[attr.aria-label]': 'ariaLabel() ?? reasoningEffort.label()',
    '[class]': 'classes()',
  },
  template: `
    <ng-content>
      @for (level of reasoningEffort.levels(); track level.value) {
        <button aiReasoningEffortItem [value]="level.value"></button>
      }
    </ng-content>
  `,
})
export class ReasoningEffortList {
  protected readonly reasoningEffort = injectReasoningEffort();

  /** Accessible name for the list of effort choices. Defaults to the root label. */
  public readonly ariaLabel = input<string | undefined>(undefined);
  /** Additional classes merged onto the effort list. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() => twMerge('flex flex-col gap-1', this.userClass()));
}
