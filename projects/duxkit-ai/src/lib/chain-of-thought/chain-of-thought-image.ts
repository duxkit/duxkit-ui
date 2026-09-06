import { Directive, computed, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';

@Directive({
  selector: '[aiChainOfThoughtImage],ai-chain-of-thought-image',
  host: {
    '[class]': 'classes()',
  },
})
export class ChainOfThoughtImage {
  /** Additional classes merged onto the image wrapper element. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() => twMerge('mt-2 grid gap-2', this.userClass()));
}
