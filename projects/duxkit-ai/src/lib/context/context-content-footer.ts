import { Component, computed, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';
import { contextCostUSD, formatContextCost } from './context-cost';
import { injectContext } from './context-root';

export const contextContentFooterClasses =
  'flex w-full items-center justify-between gap-4 bg-secondary px-4 py-3 text-xs';

@Component({
  selector: 'ai-context-content-footer,[aiContextContentFooter]',
  host: {
    '[class]': 'classes()',
  },
  template: `
    <ng-content>
      <span class="text-muted-foreground">Total cost</span>
      <span>{{ totalCost() }}</span>
    </ng-content>
  `,
})
export class ContextContentFooter {
  private readonly context = injectContext();

  /** Additional classes merged onto the context content footer. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly totalCost = computed(() =>
    formatContextCost(contextCostUSD(this.context.modelId(), this.context.usage(), 'total')),
  );
  protected readonly classes = computed(() =>
    twMerge(contextContentFooterClasses, this.userClass()),
  );
}
