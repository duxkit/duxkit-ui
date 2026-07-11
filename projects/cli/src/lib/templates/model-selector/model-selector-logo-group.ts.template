import { computed, Directive, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';

export const modelSelectorLogoGroupClasses =
  'flex shrink-0 items-center -space-x-1 [&>img]:rounded-full [&>img]:bg-background [&>img]:p-px [&>img]:ring-1 dark:[&>img]:bg-foreground';

@Directive({
  selector: 'ai-model-selector-logo-group,[aiModelSelectorLogoGroup]',
  host: {
    'data-slot': 'model-selector-logo-group',
    '[class]': 'classes()',
  },
})
export class ModelSelectorLogoGroup {
  /** Additional classes merged onto the model selector logo group. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() =>
    twMerge(modelSelectorLogoGroupClasses, this.userClass()),
  );
}
