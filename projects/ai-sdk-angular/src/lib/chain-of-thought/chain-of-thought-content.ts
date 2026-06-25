import { Component, computed, input } from '@angular/core';
import { BrnCollapsibleContent } from '@spartan-ng/brain/collapsible';
import { twMerge } from 'tailwind-merge';

@Component({
  selector: '[aiChainOfThoughtContent],ai-chain-of-thought-content',
  hostDirectives: [{ directive: BrnCollapsibleContent, inputs: ['id'] }],
  host: {
    '[class]': 'classes()',
  },
  template: '<ng-content />',
})
export class ChainOfThoughtContent {
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() =>
    twMerge(
      'mt-2 flex flex-col gap-3 text-popover-foreground outline-none data-[state=closed]:hidden',
      this.userClass(),
    ),
  );
}
