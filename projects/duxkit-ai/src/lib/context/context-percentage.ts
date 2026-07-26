import { Component, computed, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';
import { injectContext } from './context-root';

export const contextPercentageClasses = 'shrink-0 tabular-nums';

@Component({
  selector: 'ai-context-percentage,[aiContextPercentage]',
  host: {
    '[class]': 'classes()',
  },
  template: '{{ context.renderedPercent() }}',
})
export class ContextPercentage {
  protected readonly context = injectContext();

  /** Additional classes merged onto the context percentage. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() => twMerge(contextPercentageClasses, this.userClass()));
}
