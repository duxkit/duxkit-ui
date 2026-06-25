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
      <ng-content />
    </div>

    @if (caption() !== undefined) {
      <p class="m-0 text-muted-foreground text-xs">{{ caption() }}</p>
    }
  `,
})
export class ChainOfThoughtImage {
  public readonly caption = input<string | undefined>();
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() => twMerge('mt-2 space-y-2', this.userClass()));
}
