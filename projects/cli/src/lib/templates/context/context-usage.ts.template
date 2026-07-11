import { Component, computed, inject, input, type Signal } from '@angular/core';
import { twMerge } from 'tailwind-merge';
import { formatContextTokens } from './context';
import {
  AI_CONTEXT_COST_CALCULATOR,
  contextCostUSD,
  formatContextCost,
  type ContextCostKind,
} from './context-cost';
import { injectContext } from './context-root';

export const contextUsageClasses = 'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 text-xs';

abstract class ContextUsageRow {
  protected readonly context = injectContext();
  private readonly costCalculator = inject(AI_CONTEXT_COST_CALCULATOR, { optional: true });

  protected abstract readonly label: string;
  protected abstract readonly costKind: ContextCostKind;
  protected abstract readonly tokens: Signal<number>;

  protected readonly hasTokens = computed(() => this.tokens() > 0);
  protected readonly renderedTokens = computed(() => formatContextTokens(this.tokens()));
  protected readonly costUSD = computed(() =>
    contextCostUSD(
      this.costCalculator,
      this.context.modelId(),
      this.context.usage(),
      this.costKind,
    ),
  );
  protected readonly renderedCost = computed(() => formatContextCost(this.costUSD()));
}

@Component({
  selector: 'ai-context-input-usage,[aiContextInputUsage]',
  host: {
    '[class]': 'classes()',
  },
  template: `
    @if (hasTokens()) {
      <ng-content>
        <span class="text-muted-foreground">{{ label }}</span>
        <span class="whitespace-nowrap text-right tabular-nums">
          {{ renderedTokens() }}
          @if (costUSD() !== undefined) {
            <span class="ml-2 text-muted-foreground">- {{ renderedCost() }}</span>
          }
        </span>
      </ng-content>
    }
  `,
})
export class ContextInputUsage extends ContextUsageRow {
  /** Additional classes merged onto the input usage row. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly label = 'Input';
  protected readonly costKind = 'input';
  protected readonly tokens = computed(() => this.context.tokenUsage().inputTokens);
  protected readonly classes = computed(() => twMerge(contextUsageClasses, this.userClass()));
}

@Component({
  selector: 'ai-context-output-usage,[aiContextOutputUsage]',
  host: {
    '[class]': 'classes()',
  },
  template: `
    @if (hasTokens()) {
      <ng-content>
        <span class="text-muted-foreground">{{ label }}</span>
        <span class="whitespace-nowrap text-right tabular-nums">
          {{ renderedTokens() }}
          @if (costUSD() !== undefined) {
            <span class="ml-2 text-muted-foreground">- {{ renderedCost() }}</span>
          }
        </span>
      </ng-content>
    }
  `,
})
export class ContextOutputUsage extends ContextUsageRow {
  /** Additional classes merged onto the output usage row. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly label = 'Output';
  protected readonly costKind = 'output';
  protected readonly tokens = computed(() => this.context.tokenUsage().outputTokens);
  protected readonly classes = computed(() => twMerge(contextUsageClasses, this.userClass()));
}

@Component({
  selector: 'ai-context-reasoning-usage,[aiContextReasoningUsage]',
  host: {
    '[class]': 'classes()',
  },
  template: `
    @if (hasTokens()) {
      <ng-content>
        <span class="text-muted-foreground">{{ label }}</span>
        <span class="whitespace-nowrap text-right tabular-nums">
          {{ renderedTokens() }}
          @if (costUSD() !== undefined) {
            <span class="ml-2 text-muted-foreground">- {{ renderedCost() }}</span>
          }
        </span>
      </ng-content>
    }
  `,
})
export class ContextReasoningUsage extends ContextUsageRow {
  /** Additional classes merged onto the reasoning usage row. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly label = 'Reasoning';
  protected readonly costKind = 'reasoning';
  protected readonly tokens = computed(() => this.context.tokenUsage().reasoningTokens);
  protected readonly classes = computed(() => twMerge(contextUsageClasses, this.userClass()));
}

@Component({
  selector: 'ai-context-cache-usage,[aiContextCacheUsage]',
  host: {
    '[class]': 'classes()',
  },
  template: `
    @if (hasTokens()) {
      <ng-content>
        <span class="text-muted-foreground">{{ label }}</span>
        <span class="whitespace-nowrap text-right tabular-nums">
          {{ renderedTokens() }}
          @if (costUSD() !== undefined) {
            <span class="ml-2 text-muted-foreground">- {{ renderedCost() }}</span>
          }
        </span>
      </ng-content>
    }
  `,
})
export class ContextCacheUsage extends ContextUsageRow {
  /** Additional classes merged onto the cache usage row. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly label = 'Cache';
  protected readonly costKind = 'cache';
  protected readonly tokens = computed(() => this.context.tokenUsage().cacheReadTokens);
  protected readonly classes = computed(() => twMerge(contextUsageClasses, this.userClass()));
}
