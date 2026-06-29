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
    <div data-slot="model-selector-group-heading" [class]="headingClasses">{{ heading() }}</div>
    <ng-content />
  `,
})
export class ModelSelectorGroup {
  /** Visible provider group heading. */
  public readonly heading = input.required<string>();
  /** Additional classes merged onto the model selector group. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly headingClasses = modelSelectorGroupHeadingClasses;
  protected readonly classes = computed(() => twMerge(modelSelectorGroupClasses, this.userClass()));
}
