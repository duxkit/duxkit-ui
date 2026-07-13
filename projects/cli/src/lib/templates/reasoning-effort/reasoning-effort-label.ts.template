import { Component, computed, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';
import { injectReasoningEffort } from './reasoning-effort-root';

@Component({
  selector: 'ai-reasoning-effort-label,[aiReasoningEffortLabel]',
  host: {
    'data-slot': 'reasoning-effort-label',
    '[class]': 'classes()',
  },
  template: '<ng-content>{{ reasoningEffort.label() }}</ng-content>',
})
export class ReasoningEffortLabel {
  protected readonly reasoningEffort = injectReasoningEffort();

  /** Additional classes merged onto the label element. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() =>
    twMerge('text-sm font-medium text-foreground', this.userClass()),
  );
}
