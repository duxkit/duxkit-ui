import { Component, computed, input } from '@angular/core';
import {
  BrnDialogContent,
  BrnDialogDescription,
  BrnDialogTitle,
} from '@spartan-ng/brain/dialog';
import { BrnCommand, provideBrnCommandConfig } from '@spartan-ng/brain/command';
import { twMerge } from 'tailwind-merge';
import { injectModelSelector } from './model-selector-root';
import { modelSelectorFuzzyFilter } from './model-selector.types';

export const modelSelectorContentClasses =
  'bg-popover text-popover-foreground grid w-[min(92vw,520px)] overflow-hidden rounded-xl outline-none ring-1 ring-border';
export const modelSelectorCommandClasses = 'flex size-full flex-col overflow-hidden p-0';

@Component({
  selector: 'ai-model-selector-content,[aiModelSelectorContent]',
  imports: [BrnDialogContent, BrnDialogDescription, BrnDialogTitle],
  hostDirectives: [
    {
      directive: BrnCommand,
      inputs: ['id', 'disabled', 'search'],
      outputs: ['valueChange', 'searchChange'],
    },
  ],
  providers: [provideBrnCommandConfig({ filter: modelSelectorFuzzyFilter })],
  template: `
    <ng-template brnDialogContent>
      <div data-slot="model-selector-content" [class]="classes()">
        <h2 brnDialogTitle class="sr-only">{{ title() }}</h2>
        @if (description(); as descriptionText) {
          <p brnDialogDescription class="sr-only">{{ descriptionText }}</p>
        }
        <div [class]="commandClasses">
          <ng-content />
        </div>
      </div>
    </ng-template>
  `,
})
export class ModelSelectorContent {
  /** Accessible dialog title rendered visually hidden by default. */
  public readonly title = input<string>('Model Selector');
  /** Accessible dialog description rendered visually hidden when provided. */
  public readonly description = input<string | undefined>(undefined);
  /** Additional classes merged onto the dialog content surface. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly commandClasses = modelSelectorCommandClasses;
  protected readonly classes = computed(() =>
    twMerge(modelSelectorContentClasses, this.userClass()),
  );

  public constructor() {
    injectModelSelector();
  }
}
