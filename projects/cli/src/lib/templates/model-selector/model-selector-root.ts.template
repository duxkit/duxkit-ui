import { inject } from '@angular/core';
import { ModelSelector } from './model-selector';

export function injectModelSelector(): ModelSelector {
  const modelSelector = inject(ModelSelector, { optional: true });

  if (!modelSelector) {
    throw new Error('Model selector components must be used within ModelSelector');
  }

  return modelSelector;
}
