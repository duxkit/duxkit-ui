import { Component, computed, input } from '@angular/core';
import { BrnCollapsibleContent } from '@spartan-ng/brain/collapsible';
import { twMerge } from 'tailwind-merge';

@Component({
  selector: '[aiSourcesContent],ai-sources-content',
  hostDirectives: [{ directive: BrnCollapsibleContent, inputs: ['id'] }],
  host: {
    '[class]': 'classes()',
  },
  template: ` <ng-content /> `,
})
export class SourcesContent {
  /** Additional classes merged onto the collapsible sources content region. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() =>
    twMerge(
      'mt-3 flex w-fit flex-col gap-2 outline-none data-[state=closed]:hidden data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 data-[state=closed]:animate-out data-[state=open]:animate-in',
      this.userClass(),
    ),
  );
}
