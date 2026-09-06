import { Directive, computed, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';
@Directive({
  selector: '[aiChainOfThoughtImageFrame],ai-chain-of-thought-image-frame',
  host: { '[class]': 'classes()' },
})
export class ChainOfThoughtImageFrame {
  /** Additional classes merged onto the optional image frame. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });
  protected readonly classes = computed(() =>
    twMerge(
      'relative flex max-h-88 items-center justify-center overflow-hidden rounded-lg bg-muted p-3',
      this.userClass(),
    ),
  );
}
