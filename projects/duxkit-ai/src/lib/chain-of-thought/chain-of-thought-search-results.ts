import { Component, computed, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';

@Component({
  selector: '[aiChainOfThoughtSearchResults],ai-chain-of-thought-search-results',
  host: {
    '[class]': 'classes()',
  },
  template: '<ng-content />',
})
export class ChainOfThoughtSearchResults {
  /** Additional classes merged onto the search results container. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() =>
    twMerge('flex flex-wrap items-center gap-2', this.userClass()),
  );
}
