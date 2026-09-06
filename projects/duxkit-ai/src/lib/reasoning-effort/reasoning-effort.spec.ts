import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HlmButton } from '@duxkit-private/ui/helm/button';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  ReasoningEffort,
  ReasoningEffortImports,
  ReasoningEffortSlider,
  type ReasoningEffortLevel,
} from './';

class ResizeObserverMock implements ResizeObserver {
  readonly callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  disconnect(): void {}
  observe(): void {}
  unobserve(): void {}
}

@Component({
  imports: [ReasoningEffortImports],
  template: `
    <ai-reasoning-effort
      class="custom-root"
      [disabled]="disabled()"
      [label]="label()"
      [levels]="levels()"
      [value]="value()"
      (valueChange)="value.set($event)"
    >
      <button aiReasoningEffortTrigger aria-label="Choose reasoning effort" class="custom-trigger">
        {{ label() }}: <span aiReasoningEffortValue></span>
      </button>
      <ai-reasoning-effort-content class="custom-content">
        <div class="mb-4 flex items-center justify-between gap-4">
          <ai-reasoning-effort-label />
          <ai-reasoning-effort-value />
        </div>
        @if (control() === 'slider') {
          <ai-reasoning-effort-slider class="custom-slider" />
        } @else {
          <ai-reasoning-effort-list class="custom-list" />
        }
      </ai-reasoning-effort-content>
    </ai-reasoning-effort>
  `,
})
class Host {
  readonly control = signal<'slider' | 'list'>('slider');
  readonly disabled = signal(false);
  readonly label = signal('Reasoning effort');
  readonly levels = signal<readonly ReasoningEffortLevel[]>([
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'xhigh', label: 'Extra high' },
    { value: 'max', label: 'Maximum' },
    { value: 'ultra', label: 'Ultra' },
  ]);
  readonly value = signal('medium');
}

@Component({
  imports: [HlmButton, ReasoningEffortImports],
  template: `
    <ai-reasoning-effort>
      <button
        aiReasoningEffortTrigger
        hlmBtn
        class="custom-hlm-trigger"
        variant="outline"
        size="sm"
      >
        <span>Custom reasoning trigger</span>
        <span aiReasoningEffortValue class="custom-value"></span>
      </button>
      <ai-reasoning-effort-content>
        <ai-reasoning-effort-list>
          <button aiReasoningEffortItem value="low" [showIndicator]="false">Fast</button>
          <button aiReasoningEffortItem value="high" [showIndicator]="false">Careful</button>
        </ai-reasoning-effort-list>
      </ai-reasoning-effort-content>
    </ai-reasoning-effort>
  `,
})
class CustomCompositionHost {}

@Component({
  imports: [ReasoningEffortSlider],
  template: '<ai-reasoning-effort-slider />',
})
class OrphanSliderHost {}

function getTrigger(fixture: ComponentFixture<Host>): HTMLButtonElement {
  const element = fixture.nativeElement as HTMLElement;
  const trigger = element.querySelector<HTMLButtonElement>(
    '[data-slot="reasoning-effort-trigger"]',
  );

  if (!trigger) {
    throw new Error('Expected reasoning effort trigger');
  }

  return trigger;
}

function getContent(): HTMLElement {
  const content = document.body.querySelector<HTMLElement>(
    '[data-slot="reasoning-effort-content"]',
  );

  if (!content) {
    throw new Error('Expected reasoning effort popover content');
  }

  return content;
}

async function settle<T>(fixture: ComponentFixture<T>): Promise<void> {
  fixture.detectChanges();
  await fixture.whenStable();
  await new Promise((resolve) => globalThis.setTimeout(resolve));
  fixture.detectChanges();
}

async function open(fixture: ComponentFixture<Host>): Promise<void> {
  getTrigger(fixture).click();
  await settle(fixture);
}

describe('ReasoningEffort', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    vi.stubGlobal('ResizeObserver', ResizeObserverMock);
    document.body.querySelectorAll('.cdk-overlay-container').forEach((element) => element.remove());

    await TestBed.configureTestingModule({
      imports: [Host],
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    await settle(fixture);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('composes a root, native trigger, content, label, value, and slider', async () => {
    const element = fixture.nativeElement as HTMLElement;
    const root = element.querySelector('[data-slot="reasoning-effort"]');
    const trigger = getTrigger(fixture);

    expect(root?.classList).toContain('custom-root');
    expect(trigger.type).toBe('button');
    expect(trigger.textContent).toContain('Reasoning effort: Medium');
    expect(trigger.getAttribute('aria-label')).toBe('Choose reasoning effort');
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.classList).toContain('custom-trigger');
    expect(trigger.querySelector('ng-icon')).toBeNull();

    await open(fixture);

    const content = getContent();

    expect(content.getAttribute('role')).toBe('dialog');
    expect(content.getAttribute('aria-label')).toBe('Reasoning effort');
    expect(content.classList).toContain('custom-content');
    expect(content.querySelector('[data-slot="reasoning-effort-label"]')?.textContent).toContain(
      'Reasoning effort',
    );
    expect(content.querySelector('[data-slot="reasoning-effort-value"]')?.textContent).toContain(
      'Medium',
    );
    expect(content.querySelector('[data-slot="reasoning-effort-slider-root"]')).not.toBeNull();
  });

  it('wires the Brain slider to the root model and accessible level wording', async () => {
    await open(fixture);

    const content = getContent();
    const thumb = content.querySelector<HTMLElement>('[data-slot="slider-thumb"]');

    expect(thumb?.getAttribute('role')).toBe('slider');
    expect(thumb?.getAttribute('aria-label')).toBe('Reasoning effort');
    expect(thumb?.classList).toContain('absolute');
    expect(thumb?.getAttribute('aria-valuenow')).toBe('1');
    expect(thumb?.getAttribute('aria-valuemax')).toBe('5');
    expect(thumb?.getAttribute('aria-valuetext')).toBe('Medium');

    const labels = content.querySelector<HTMLElement>(
      '[data-slot="reasoning-effort-slider-labels"]',
    );
    const labelStops = labels?.querySelectorAll<HTMLElement>(
      '[data-slot="reasoning-effort-slider-label-stop"]',
    );

    expect(labels?.style.paddingInline).toBe('8px');
    expect(labelStops).toHaveLength(6);
    expect(
      Array.from(labelStops ?? []).every((stop) =>
        stop.firstElementChild?.classList.contains('shrink-0'),
      ),
    ).toBe(true);

    thumb?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
    await settle(fixture);

    expect(fixture.componentInstance.value()).toBe('high');
    expect(thumb?.getAttribute('aria-valuenow')).toBe('2');
    expect(thumb?.getAttribute('aria-valuetext')).toBe('High');
  });

  it('does not render a misleading slider position for an unavailable controlled value', async () => {
    fixture.componentInstance.value.set('provider-only');
    await settle(fixture);
    await open(fixture);

    const content = getContent();

    expect(getTrigger(fixture).textContent).toContain('Reasoning effort: Unavailable');
    expect(content.querySelector('[data-slot="reasoning-effort-slider"]')).toBeNull();
    expect(content.querySelector('[data-slot="reasoning-effort-slider-labels"]')).toBeNull();
  });

  it('swaps the slider for a default list generated from configurable levels', async () => {
    fixture.componentInstance.control.set('list');
    fixture.componentInstance.label.set('Thinking depth');
    fixture.componentInstance.levels.set([
      { value: 'quick', label: 'Quick', description: 'Answers with minimal deliberation.' },
      { value: 'deep', label: 'Deep', description: 'Spends more time checking the answer.' },
    ]);
    fixture.componentInstance.value.set('quick');
    await settle(fixture);
    await open(fixture);

    const options = getContent().querySelectorAll<HTMLButtonElement>(
      '[data-slot="reasoning-effort-item"]',
    );

    expect(options).toHaveLength(2);
    expect(options[0]?.getAttribute('aria-pressed')).toBe('true');
    expect(options[1]?.textContent).toContain('Spends more time checking the answer.');

    options[1]?.click();
    await settle(fixture);

    const trigger = getTrigger(fixture);

    expect(fixture.componentInstance.value()).toBe('deep');
    expect(trigger.textContent).toContain('Thinking depth: Deep');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger);
  });

  it('supports projected trigger and list-item content while preserving HLM classes', async () => {
    await TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [CustomCompositionHost],
      })
      .compileComponents();

    const customFixture = TestBed.createComponent(CustomCompositionHost);
    await settle(customFixture);
    const element = customFixture.nativeElement as HTMLElement;
    const trigger = element.querySelector<HTMLButtonElement>('button[aiReasoningEffortTrigger]');

    expect(trigger?.classList).toContain('custom-hlm-trigger');
    expect(trigger?.classList).toContain('group/button');
    expect(trigger?.textContent).toContain('Custom reasoning trigger');
    expect(trigger?.querySelector('.custom-value')?.textContent).toContain('Medium');

    trigger?.click();
    await settle(customFixture);

    const items = getContent().querySelectorAll<HTMLButtonElement>(
      '[data-slot="reasoning-effort-item"]',
    );

    expect(items).toHaveLength(2);
    expect(items[0]?.textContent).toContain('Fast');
    expect(items[0]?.querySelector('ng-icon')).toBeNull();
  });

  it('disables child controls from the root or when no levels exist', async () => {
    const trigger = getTrigger(fixture);

    fixture.componentInstance.disabled.set(true);
    await settle(fixture);
    expect(trigger.disabled).toBe(true);

    fixture.componentInstance.disabled.set(false);
    fixture.componentInstance.levels.set([]);
    await settle(fixture);
    expect(trigger.disabled).toBe(true);
  });

  it('fails clearly when a composable child is used outside its root', async () => {
    await TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [OrphanSliderHost],
      })
      .compileComponents();

    expect(() => TestBed.createComponent(OrphanSliderHost)).toThrow(
      /Reasoning effort components must be used within ReasoningEffort/,
    );
  });
});
