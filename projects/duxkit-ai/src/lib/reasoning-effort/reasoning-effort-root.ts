import { inject } from '@angular/core';
import { ReasoningEffort } from './reasoning-effort';

export function injectReasoningEffort(): ReasoningEffort {
  const reasoningEffort = inject(ReasoningEffort, { optional: true });

  if (!reasoningEffort) {
    throw new Error('Reasoning effort components must be used within ReasoningEffort');
  }

  return reasoningEffort;
}
