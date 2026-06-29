import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HlmButton } from '@duxkit/ui/helm/button';
import type { LanguageModelUsage } from 'ai';

import {
  Context,
  ContextCacheUsage,
  ContextContent,
  ContextContentBody,
  ContextContentFooter,
  ContextContentHeader,
  ContextIcon,
  ContextInputUsage,
  ContextOutputUsage,
  ContextReasoningUsage,
  ContextTrigger,
} from './';

const usage: LanguageModelUsage = {
  inputTokens: 32_000,
  inputTokenDetails: {
    cacheReadTokens: 4_000,
    cacheWriteTokens: 0,
    noCacheTokens: 28_000,
  },
  outputTokens: 8_000,
  outputTokenDetails: {
    reasoningTokens: 1_500,
    textTokens: 6_500,
  },
  totalTokens: 41_500,
};

const deprecatedOnlyUsage: LanguageModelUsage = {
  inputTokens: 1_000,
  inputTokenDetails: {
    cacheReadTokens: undefined,
    cacheWriteTokens: undefined,
    noCacheTokens: 1_000,
  },
  outputTokens: 2_000,
  outputTokenDetails: {
    reasoningTokens: undefined,
    textTokens: 2_000,
  },
  reasoningTokens: 750,
  cachedInputTokens: 500,
  totalTokens: 3_000,
};

@Component({
  imports: [
    Context,
    ContextCacheUsage,
    ContextContent,
    ContextContentBody,
    ContextContentFooter,
    ContextContentHeader,
    ContextInputUsage,
    ContextOutputUsage,
    ContextReasoningUsage,
    ContextTrigger,
  ],
  template: `
    <ai-context
      class="custom-context"
      [usedTokens]="usedTokens()"
      [maxTokens]="maxTokens()"
      [usage]="usage()"
      modelId="openai:gpt-4o-mini"
    >
      <button aiContextTrigger class="custom-trigger"></button>
      <ai-context-content class="custom-content" />
      <ai-context-content-header class="custom-header" />
      <ai-context-content-body class="custom-body">
        <ai-context-input-usage class="custom-input" />
        <ai-context-output-usage />
        <ai-context-reasoning-usage />
        <ai-context-cache-usage />
      </ai-context-content-body>
      <ai-context-content-footer class="custom-footer" />
    </ai-context>
  `,
})
class Host {
  readonly usedTokens = signal(40_000);
  readonly maxTokens = signal(128_000);
  readonly usage = signal(usage);
  readonly context = viewChild.required(Context);
}

@Component({
  imports: [ContextIcon],
  template: '<ai-context-icon />',
})
class OrphanIconHost {}

@Component({
  imports: [Context, ContextTrigger, HlmButton],
  template: `
    <ai-context [usedTokens]="10" [maxTokens]="100">
      <button aiContextTrigger hlmBtn variant="ghost" size="sm"></button>
    </ai-context>
  `,
})
class HlmTriggerHost {}

describe('Context', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('provides formatted context usage state from the root', () => {
    const context = fixture.componentInstance.context();

    expect(context.usedPercent()).toBeCloseTo(0.3125);
    expect(context.renderedPercent()).toBe('31.3%');
    expect(context.renderedTokens()).toBe('40K / 128K');
    expect(context.progressValue()).toBe(31.25);
    expect(context.clampedUsedPercent()).toBe(0.3125);
  });

  it('renders the default trigger with percentage text, hover-card hooks, and progress icon', () => {
    const element = fixture.nativeElement as HTMLElement;
    const trigger = element.querySelector('button[aicontexttrigger]');
    const icon = trigger?.querySelector('ai-context-icon svg');

    expect(trigger?.textContent).toContain('31.3%');
    expect(trigger?.classList).toContain('custom-trigger');
    expect(trigger?.hasAttribute('brnHoverCardTrigger')).toBe(true);
    expect(icon?.getAttribute('aria-label')).toBe('Model context usage');
    expect(icon?.querySelectorAll('circle').length).toBe(2);
  });

  it('renders content header, usage rows, and total cost footer', () => {
    const element = fixture.nativeElement as HTMLElement;
    const content = element.querySelector('ai-context-content');
    const header = element.querySelector('ai-context-content-header');
    const body = element.querySelector('ai-context-content-body');
    const footer = element.querySelector('ai-context-content-footer');

    expect(content?.classList).toContain('custom-content');
    expect(content?.classList).toContain('min-w-72');
    expect(header?.textContent).toContain('31.3%');
    expect(header?.textContent).toContain('40K / 128K');
    expect(header?.classList).toContain('block');
    expect(header?.classList).toContain('p-4');
    expect(header?.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')).toBe(
      '31.25',
    );
    expect(body?.classList).toContain('px-4');
    expect(body?.textContent).toContain('Input');
    expect(body?.textContent).toContain('32K');
    expect(body?.textContent).toContain('Output');
    expect(body?.textContent).toContain('8K');
    expect(body?.textContent).toContain('Reasoning');
    expect(body?.textContent).toContain('1.5K');
    expect(body?.textContent).toContain('Cache');
    expect(body?.textContent).toContain('4K');
    expect(footer?.classList).toContain('px-4');
    expect(footer?.textContent).toContain('Total cost');
    expect(footer?.textContent).toContain('$');
    expect(element.querySelector('ai-context-input-usage')?.classList).toContain('custom-input');
  });

  it('uses AI SDK token detail fields instead of deprecated flat token fields', () => {
    fixture.componentInstance.usage.set(deprecatedOnlyUsage);
    fixture.detectChanges();

    const context = fixture.componentInstance.context();

    expect(context.tokenUsage().reasoningTokens).toBe(0);
    expect(context.tokenUsage().cacheReadTokens).toBe(0);
  });

  it('clamps visual progress while preserving rendered token totals', () => {
    fixture.componentInstance.usedTokens.set(150_000);
    fixture.detectChanges();

    const context = fixture.componentInstance.context();
    const element = fixture.nativeElement as HTMLElement;
    const progress = element.querySelector('[role="progressbar"]');

    expect(context.usedPercent()).toBeGreaterThan(1);
    expect(context.clampedUsedPercent()).toBe(1);
    expect(context.renderedTokens()).toBe('150K / 128K');
    expect(progress?.getAttribute('aria-valuenow')).toBe('100');
  });

  it('keeps HLM button classes when composed with hlmBtn', async () => {
    await TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [HlmTriggerHost],
      })
      .compileComponents();

    const hlmFixture = TestBed.createComponent(HlmTriggerHost);
    hlmFixture.detectChanges();
    await hlmFixture.whenStable();

    const element = hlmFixture.nativeElement as HTMLElement;
    const trigger = element.querySelector('button[aicontexttrigger]');

    expect(trigger?.classList).toContain('group/button');
    expect(trigger?.classList).toContain('text-muted-foreground');
    expect(trigger?.classList).toContain('hover:text-foreground');
  });

  it('throws a clear error when context pieces are used outside the root', async () => {
    await TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [OrphanIconHost],
      })
      .compileComponents();

    expect(() => {
      const orphanFixture = TestBed.createComponent(OrphanIconHost);
      orphanFixture.detectChanges();
    }).toThrowError('Context components must be used within Context');
  });
});
