import { computed, Directive, input } from '@angular/core';
import { BrnCollapsible } from '@spartan-ng/brain/collapsible';
import { twMerge } from 'tailwind-merge';

@Directive({
  selector: '[aiSources],ai-sources',
  hostDirectives: [
    {
      directive: BrnCollapsible,
      inputs: ['expanded', 'disabled'],
      outputs: ['expandedChange'],
    },
  ],
  host: {
    '[class]': 'classes()',
  },
})
export class Sources {
  /** Additional classes merged onto the sources root element. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() =>
    twMerge('not-prose mb-4 text-blue-500 text-xs', this.userClass()),
  );
}
