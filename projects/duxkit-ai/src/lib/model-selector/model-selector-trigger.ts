import { computed, Directive, input } from '@angular/core';
import { BrnDialogTrigger } from '@spartan-ng/brain/dialog';
import { twMerge } from 'tailwind-merge';
import { injectModelSelector } from './model-selector-root';

export const modelSelectorTriggerClasses = 'inline-flex min-w-0 items-center gap-2';

@Directive({
  selector: 'button[aiModelSelectorTrigger],button[ai-model-selector-trigger]',
  hostDirectives: [{ directive: BrnDialogTrigger, inputs: ['id', 'type'] }],
  host: {
    '[class]': 'classes()',
  },
})
export class ModelSelectorTrigger {
  /** Additional classes merged onto the model selector trigger button. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() =>
    twMerge(modelSelectorTriggerClasses, this.userClass()),
  );

  public constructor() {
    injectModelSelector();
  }
}
