import { Directive, computed, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';

@Directive({
  selector: '[aiChainOfThoughtSearchResults],ai-chain-of-thought-search-results',
  host: {
    '[class]': 'classes()',
  },
})
export class ChainOfThoughtSearchResults {
  /** Additional classes merged onto the search results container. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() =>
    twMerge('flex flex-wrap items-center gap-2', this.userClass()),
  );
}
