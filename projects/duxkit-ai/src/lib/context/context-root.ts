import { inject } from '@angular/core';
import { Context } from './context';

export function injectContext(): Context {
  const context = inject(Context, { optional: true });

  if (!context) {
    throw new Error('Context components must be used within Context');
  }

  return context;
}
