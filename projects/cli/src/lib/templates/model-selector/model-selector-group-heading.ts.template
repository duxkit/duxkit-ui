import { Component, computed, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';
import { modelSelectorGroupHeadingClasses } from './model-selector-group';

@Component({
  selector: '[aiModelSelectorGroupHeading],ai-model-selector-group-heading',
  host: {
    'data-slot': 'model-selector-group-heading',
    '[class]': 'classes()',
  },
  template: '<ng-content />',
})
export class ModelSelectorGroupHeading {
  /** Additional classes merged onto the model selector group heading. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });
  protected readonly classes = computed(() =>
    twMerge(modelSelectorGroupHeadingClasses, this.userClass()),
  );
}
