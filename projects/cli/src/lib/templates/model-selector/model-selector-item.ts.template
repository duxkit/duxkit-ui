import { computed, Directive, input } from '@angular/core';
import { BrnCommandItem } from '@spartan-ng/brain/command';
import { twMerge } from 'tailwind-merge';

export const modelSelectorItemClasses =
  'data-selected:bg-muted data-selected:text-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-hidden:hidden';

@Directive({
  selector: 'button[aiModelSelectorItem],button[ai-model-selector-item]',
  hostDirectives: [
    {
      directive: BrnCommandItem,
      inputs: ['id', 'value', 'disabled'],
      outputs: ['selected'],
    },
  ],
  host: {
    'data-slot': 'model-selector-item',
    '[class]': 'classes()',
  },
})
export class ModelSelectorItem {
  /** Additional classes merged onto the model selector item. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() => twMerge(modelSelectorItemClasses, this.userClass()));
}
