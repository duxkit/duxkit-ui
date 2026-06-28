import { Component, computed, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';

@Component({
  selector: '[aiChainOfThoughtSearchResult],ai-chain-of-thought-search-result',
  host: {
    '[class]': 'classes()',
  },
  template: '<ng-content />',
})
export class ChainOfThoughtSearchResult {
  /** Additional classes merged onto the search result token element. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() =>
    twMerge(
      'inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 font-normal text-muted-foreground text-xs',
      this.userClass(),
    ),
  );
}
