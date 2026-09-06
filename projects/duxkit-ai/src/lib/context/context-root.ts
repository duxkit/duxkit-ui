import { inject } from '@angular/core';
import { ContextData } from './context-data';

export function injectContext(): ContextData {
  const context = inject(ContextData, { optional: true });

  if (!context) {
    throw new Error('Context components must be used within Context');
  }

  return context;
}
