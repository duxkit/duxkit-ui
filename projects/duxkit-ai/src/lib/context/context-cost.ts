import { InjectionToken } from '@angular/core';
import type { LanguageModelUsage } from 'ai';

export type ContextCostKind = 'input' | 'output' | 'reasoning' | 'cache' | 'total';

export interface ContextCostCalculatorArgs {
  readonly modelId: string;
  readonly usage: LanguageModelUsage | undefined;
  readonly kind: ContextCostKind;
  readonly tokens: {
    readonly inputTokens: number;
    readonly outputTokens: number;
    readonly reasoningTokens: number;
    readonly cacheReadTokens: number;
  };
}

export type ContextCostCalculator = (args: ContextCostCalculatorArgs) => number | undefined;

export const AI_CONTEXT_COST_CALCULATOR = new InjectionToken<ContextCostCalculator>(
  'AI_CONTEXT_COST_CALCULATOR',
);

export const currencyFormat = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency',
});

export function usageTokens(usage: LanguageModelUsage | undefined): {
  inputTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  cacheReadTokens: number;
} {
  return {
    inputTokens: usage?.inputTokens ?? 0,
    outputTokens: usage?.outputTokens ?? 0,
    reasoningTokens: usage?.outputTokenDetails.reasoningTokens ?? 0,
    cacheReadTokens: usage?.inputTokenDetails.cacheReadTokens ?? 0,
  };
}

export function contextCostUSD(
  calculator: ContextCostCalculator | null | undefined,
  modelId: string | undefined,
  usage: LanguageModelUsage | undefined,
  kind: ContextCostKind,
): number | undefined {
  if (!calculator || !modelId) {
    return undefined;
  }

  return calculator({
    kind,
    modelId,
    usage,
    tokens: usageTokens(usage),
  });
}

export function formatContextCost(costUSD: number | undefined): string {
  return currencyFormat.format(costUSD ?? 0);
}
