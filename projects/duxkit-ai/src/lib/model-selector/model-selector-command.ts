import { Directive } from '@angular/core';
import { BrnCommand, provideBrnCommandConfig } from '@spartan-ng/brain/command';
import { modelSelectorFuzzyFilter } from './model-selector.types';
@Directive({
  selector: '[aiModelSelectorCommand],ai-model-selector-command',
  hostDirectives: [
    {
      directive: BrnCommand,
      inputs: ['id', 'disabled', 'search', 'filter'],
      outputs: ['valueChange', 'searchChange'],
    },
  ],
  providers: [provideBrnCommandConfig({ filter: modelSelectorFuzzyFilter })],
})
export class ModelSelectorCommand {}
