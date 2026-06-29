import { computed, Directive, input } from '@angular/core';
import { BrnCommandList } from '@spartan-ng/brain/command';
import { twMerge } from 'tailwind-merge';

export const modelSelectorListClasses =
  'no-scrollbar max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto outline-none';

@Directive({
  selector: 'ai-model-selector-list,[aiModelSelectorList]',
  hostDirectives: [{ directive: BrnCommandList, inputs: ['id'] }],
  host: {
    'data-slot': 'model-selector-list',
    '[class]': 'classes()',
  },
})
export class ModelSelectorList {
  /** Additional classes merged onto the model selector list. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() => twMerge(modelSelectorListClasses, this.userClass()));
}
