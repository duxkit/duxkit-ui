import { Directive, computed, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';

@Directive({
  selector: '[aiChainOfThoughtImageCaption],ai-chain-of-thought-image-caption',
  host: { '[class]': 'classes()' },
})
export class ChainOfThoughtImageCaption {
  /** Additional classes merged onto the image caption. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });
  protected readonly classes = computed(() =>
    twMerge('m-0 text-muted-foreground text-xs', this.userClass()),
  );
}
