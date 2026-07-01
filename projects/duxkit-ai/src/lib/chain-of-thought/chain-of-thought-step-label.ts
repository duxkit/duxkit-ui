import { Component, computed, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';

@Component({
  selector: '[aiChainOfThoughtStepLabel],ai-chain-of-thought-step-label',
  host: { '[class]': 'classes()' },
  template: '<ng-content />',
})
export class ChainOfThoughtStepLabel {
  /** Additional classes merged onto the step label. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });
  protected readonly classes = computed(() => twMerge('text-foreground', this.userClass()));
}
