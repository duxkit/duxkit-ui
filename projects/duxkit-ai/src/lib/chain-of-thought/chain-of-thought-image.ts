import { Component, computed, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';

@Component({
  selector: '[aiChainOfThoughtImage],ai-chain-of-thought-image',
  host: {
    '[class]': 'classes()',
  },
  template: `
    <div
      class="relative flex max-h-[22rem] items-center justify-center overflow-hidden rounded-lg bg-muted p-3"
    >
      <ng-content
        select=":not([aiChainOfThoughtImageCaption]):not(ai-chain-of-thought-image-caption)"
      />
    </div>

    <ng-content select="[aiChainOfThoughtImageCaption],ai-chain-of-thought-image-caption" />
  `,
})
export class ChainOfThoughtImage {
  /** Additional classes merged onto the image wrapper element. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() => twMerge('mt-2 grid gap-2', this.userClass()));
}
