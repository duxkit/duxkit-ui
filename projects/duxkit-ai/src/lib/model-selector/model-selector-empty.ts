import { Directive, computed, input } from '@angular/core';
import { injectBrnCommand } from '@spartan-ng/brain/command';
import { twMerge } from 'tailwind-merge';

export const modelSelectorEmptyClasses =
  'block px-4 py-6 text-center text-muted-foreground text-sm';

@Directive({
  selector: 'ai-model-selector-empty,[aiModelSelectorEmpty]',
  host: {
    'data-slot': 'model-selector-empty',
    '[class]': 'classes()',
    '[hidden]': '!visible()',
  },
})
export class ModelSelectorEmpty {
  private readonly command = injectBrnCommand();

  /** Additional classes merged onto the empty-state element. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly visible = computed(() => !this.command.items().some((item) => item.visible()));
  protected readonly classes = computed(() => twMerge(modelSelectorEmptyClasses, this.userClass()));
}
