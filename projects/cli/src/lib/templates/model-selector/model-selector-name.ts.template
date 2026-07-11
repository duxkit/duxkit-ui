import { computed, Directive, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';

export const modelSelectorNameClasses = 'min-w-0 flex-1 truncate text-left';

@Directive({
  selector: 'ai-model-selector-name,[aiModelSelectorName]',
  host: {
    'data-slot': 'model-selector-name',
    '[class]': 'classes()',
  },
})
export class ModelSelectorName {
  /** Additional classes merged onto the model selector name. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() => twMerge(modelSelectorNameClasses, this.userClass()));
}
