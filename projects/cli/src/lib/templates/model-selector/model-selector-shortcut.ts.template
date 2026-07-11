import { computed, Directive, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';

export const modelSelectorShortcutClasses =
  'ms-auto text-muted-foreground text-xs tracking-widest group-data-[selected]/command-item:text-foreground';

@Directive({
  selector: 'ai-model-selector-shortcut,[aiModelSelectorShortcut]',
  host: {
    'data-slot': 'model-selector-shortcut',
    '[class]': 'classes()',
  },
})
export class ModelSelectorShortcut {
  /** Additional classes merged onto the model selector shortcut. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() =>
    twMerge(modelSelectorShortcutClasses, this.userClass()),
  );
}
