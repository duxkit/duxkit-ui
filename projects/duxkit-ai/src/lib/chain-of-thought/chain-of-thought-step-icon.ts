import { Component, computed, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';

@Component({
  selector: '[aiChainOfThoughtStepIcon],ai-chain-of-thought-step-icon',
  host: { '[class]': 'classes()' },
  template: '<ng-content />',
})
export class ChainOfThoughtStepIcon {
  /** Additional classes merged onto the step icon slot. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });
  protected readonly classes = computed(() =>
    twMerge('relative mt-0.5 shrink-0', this.userClass()),
  );
}
