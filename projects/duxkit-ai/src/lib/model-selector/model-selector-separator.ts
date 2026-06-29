import { computed, Directive, input } from '@angular/core';
import { BrnCommandSeparator } from '@spartan-ng/brain/command';
import { twMerge } from 'tailwind-merge';

export const modelSelectorSeparatorClasses = 'bg-border -mx-1 block h-px w-auto data-hidden:hidden';

@Directive({
  selector: 'ai-model-selector-separator,[aiModelSelectorSeparator]',
  hostDirectives: [BrnCommandSeparator],
  host: {
    'data-slot': 'model-selector-separator',
    '[class]': 'classes()',
  },
})
export class ModelSelectorSeparator {
  /** Additional classes merged onto the model selector separator. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() =>
    twMerge(modelSelectorSeparatorClasses, this.userClass()),
  );
}
