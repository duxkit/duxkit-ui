import { Directive, computed, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';

@Directive({
  selector: '[aiChainOfThoughtStepDescription],ai-chain-of-thought-step-description',
  host: { '[class]': 'classes()' },
})
export class ChainOfThoughtStepDescription {
  /** Additional classes merged onto the step description. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });
  protected readonly classes = computed(() =>
    twMerge('text-muted-foreground text-xs', this.userClass()),
  );
}
