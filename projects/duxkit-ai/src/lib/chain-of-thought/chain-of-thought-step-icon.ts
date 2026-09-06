import { Directive, computed, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';

@Directive({
  selector: '[aiChainOfThoughtStepIcon],ai-chain-of-thought-step-icon',
  host: { '[class]': 'classes()' },
})
export class ChainOfThoughtStepIcon {
  /** Additional classes merged onto the step icon slot. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });
  protected readonly classes = computed(() =>
    twMerge('relative mt-0.5 shrink-0', this.userClass()),
  );
}
