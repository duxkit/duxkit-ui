import { Component, computed, input } from '@angular/core';
import { BrnCommandGroup } from '@spartan-ng/brain/command';
import { twMerge } from 'tailwind-merge';

export const modelSelectorGroupClasses =
  'block overflow-hidden p-1 text-foreground data-hidden:hidden';
export const modelSelectorGroupHeadingClasses =
  'px-2 py-1.5 font-medium text-muted-foreground text-xs';

@Component({
  selector: 'ai-model-selector-group,[aiModelSelectorGroup]',
  hostDirectives: [{ directive: BrnCommandGroup, inputs: ['id'] }],
  host: {
    'data-slot': 'model-selector-group',
    '[class]': 'classes()',
  },
  template: `
    <ng-content select="[aiModelSelectorGroupHeading],ai-model-selector-group-heading" />
    <ng-content />
  `,
})
export class ModelSelectorGroup {
  /** Additional classes merged onto the model selector group. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() => twMerge(modelSelectorGroupClasses, this.userClass()));
}
