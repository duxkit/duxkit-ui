import type { LanguageModelUsage } from 'ai';
import { getUsage } from 'tokenlens';

export type ContextCostKind = 'input' | 'output' | 'reasoning' | 'cache' | 'total';

export const currencyFormat = new Intl.NumberFormat(undefined, {
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
  modelId: string | undefined,
  usage: LanguageModelUsage | undefined,
  kind: ContextCostKind,
): number | undefined {
  if (!modelId) {
    return undefined;
  }

  const tokens = usageTokens(usage);

  if (kind === 'input') {
    return getUsage({
      modelId,
      usage: { input: tokens.inputTokens, output: 0 },
    }).costUSD?.totalUSD;
  }

  if (kind === 'output') {
    return getUsage({
      modelId,
      usage: { input: 0, output: tokens.outputTokens },
    }).costUSD?.totalUSD;
  }

  if (kind === 'reasoning') {
    return getUsage({
      modelId,
      usage: { input: 0, output: 0, reasoningTokens: tokens.reasoningTokens },
    }).costUSD?.totalUSD;
  }

  if (kind === 'cache') {
    return getUsage({
      modelId,
      usage: { input: 0, output: 0, cacheReads: tokens.cacheReadTokens },
    }).costUSD?.totalUSD;
  }

  return getUsage({
    modelId,
    usage: {
      input: tokens.inputTokens,
      output: tokens.outputTokens,
      reasoningTokens: tokens.reasoningTokens,
      cacheReads: tokens.cacheReadTokens,
    },
  }).costUSD?.totalUSD;
}

export function formatContextCost(costUSD: number | undefined): string {
  return currencyFormat.format(costUSD ?? 0);
}
