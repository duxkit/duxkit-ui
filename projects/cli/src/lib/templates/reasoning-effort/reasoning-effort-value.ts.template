import { Component, computed, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';
import { injectReasoningEffort } from './reasoning-effort-root';

@Component({
  selector: 'ai-reasoning-effort-value,[aiReasoningEffortValue]',
  host: {
    'aria-atomic': 'true',
    'aria-live': 'polite',
    'data-slot': 'reasoning-effort-value',
    '[class]': 'classes()',
  },
  template: '<ng-content>{{ reasoningEffort.selectedLabel() }}</ng-content>',
})
export class ReasoningEffortValue {
  protected readonly reasoningEffort = injectReasoningEffort();

  /** Additional classes merged onto the selected-value element. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() =>
    twMerge('text-sm text-muted-foreground', this.userClass()),
  );
}
