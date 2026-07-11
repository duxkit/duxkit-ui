import { OverlayModule } from '@angular/cdk/overlay';
import { Component, computed, contentChild, input } from '@angular/core';
import { BrnDialogContent, BrnDialogDescription, BrnDialogTitle } from '@spartan-ng/brain/dialog';
import { BrnCommand, provideBrnCommandConfig } from '@spartan-ng/brain/command';
import { twMerge } from 'tailwind-merge';
import { ModelSelectorDescription } from './model-selector-description';
import { injectModelSelector } from './model-selector-root';
import { ModelSelectorTitle } from './model-selector-title';
import { modelSelectorFuzzyFilter } from './model-selector.types';

export const modelSelectorContentClasses =
  'bg-popover text-popover-foreground grid w-[min(92vw,520px)] overflow-hidden rounded-xl outline-none ring-1 ring-border';
export const modelSelectorCommandClasses = 'flex size-full flex-col overflow-hidden p-0';

@Component({
  selector: 'ai-model-selector-content,[aiModelSelectorContent]',
  imports: [OverlayModule, BrnDialogContent, BrnDialogDescription, BrnDialogTitle],
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
        @if (title() !== undefined) {
          <div brnDialogTitle>
            <ng-content select="[aiModelSelectorTitle],ai-model-selector-title" />
          </div>
        }
        @if (description() !== undefined) {
          <div brnDialogDescription>
            <ng-content select="[aiModelSelectorDescription],ai-model-selector-description" />
          </div>
        }
        <div [class]="commandClasses">
          <ng-content />
        </div>
      </div>
    </ng-template>
  `,
})
export class ModelSelectorContent {
  /** Additional classes merged onto the dialog content surface. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });
  protected readonly title = contentChild(ModelSelectorTitle);
  protected readonly description = contentChild(ModelSelectorDescription);

  protected readonly commandClasses = modelSelectorCommandClasses;
  protected readonly classes = computed(() =>
    twMerge(modelSelectorContentClasses, this.userClass()),
  );

  public constructor() {
    injectModelSelector();
  }
}
