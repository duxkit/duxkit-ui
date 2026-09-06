import { Directive, computed, contentChild, input, type Signal } from '@angular/core';
import type { LanguageModelUsage } from 'ai';
import { twMerge } from 'tailwind-merge';
import { ContextContent } from './context-content';

const PERCENT_MAX = 100;

const compactTokenFormat = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
  notation: 'compact',
});

const percentFormat = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
  style: 'percent',
});

export type ContextModelId = string;

export interface ContextUsage {
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly reasoningTokens: number;
  readonly cacheReadTokens: number;
}

export function formatContextTokens(tokens: number): string {
  return compactTokenFormat.format(tokens);
}

export function formatContextPercent(percent: number): string {
  return percentFormat.format(percent);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export const contextClasses = 'not-prose inline-block text-muted-foreground text-xs';

@Directive({ selector: '[aiContextData],ai-context-data', exportAs: 'aiContextData' })
export class ContextData {
  /** Number of tokens currently used in the model context window. */
  public readonly usedTokens = input.required<number>();
  /** Maximum number of tokens available in the model context window. */
  public readonly maxTokens = input.required<number>();
  /** AI SDK usage object used to render token breakdown rows and optional cost estimates. */
  public readonly usage = input<LanguageModelUsage | undefined>(undefined);
  /** Model identifier passed to the optional context cost calculator. */
  public readonly modelId = input<ContextModelId | undefined>(undefined);
  /** Additional classes merged onto the context root element. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  public readonly content = contentChild(ContextContent);

  public readonly usedPercent = computed(() => {
    const maxTokens = this.maxTokens();

    if (maxTokens <= 0) {
      return 0;
    }

    return this.usedTokens() / maxTokens;
  });
  public readonly clampedUsedPercent = computed(() => clamp(this.usedPercent(), 0, 1));
  public readonly progressValue = computed(() => this.clampedUsedPercent() * PERCENT_MAX);
  public readonly renderedPercent = computed(() => formatContextPercent(this.usedPercent()));
  public readonly renderedTokens = computed(
    () => `${formatContextTokens(this.usedTokens())} / ${formatContextTokens(this.maxTokens())}`,
  );
  public readonly tokenUsage: Signal<ContextUsage> = computed(() => {
    const usage = this.usage();

    return {
      inputTokens: usage?.inputTokens ?? 0,
      outputTokens: usage?.outputTokens ?? 0,
      reasoningTokens: usage?.outputTokenDetails.reasoningTokens ?? 0,
      cacheReadTokens: usage?.inputTokenDetails.cacheReadTokens ?? 0,
    };
  });

  protected readonly classes = computed(() => twMerge(contextClasses, this.userClass()));
}
