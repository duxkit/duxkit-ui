import { Component, computed, inject, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';
import { AI_CONTEXT_COST_CALCULATOR, contextCostUSD, formatContextCost } from './context-cost';
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
      @if (costUSD() !== undefined) {
        <span class="text-muted-foreground">Total cost</span>
        <span>{{ totalCost() }}</span>
      }
    </ng-content>
  `,
})
export class ContextContentFooter {
  private readonly context = injectContext();
  private readonly costCalculator = inject(AI_CONTEXT_COST_CALCULATOR, { optional: true });

  /** Additional classes merged onto the context content footer. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly costUSD = computed(() =>
    contextCostUSD(this.costCalculator, this.context.modelId(), this.context.usage(), 'total'),
  );
  protected readonly totalCost = computed(() => formatContextCost(this.costUSD()));
  protected readonly classes = computed(() =>
    twMerge(contextContentFooterClasses, this.userClass()),
  );
}
