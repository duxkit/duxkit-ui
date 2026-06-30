import { Component, computed, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HlmButton } from '@duxkit/ui/helm/button';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorName,
  ModelSelectorShortcut,
  ModelSelectorTrigger,
  createModelSelectorSearchValue,
  groupModelSelectorModels,
  modelSelectorFuzzyFilter,
  type ModelSelectorModel,
} from './';

const models = [
  {
    id: 'gpt-4.1',
    name: 'GPT-4.1',
    provider: 'openai',
    providerLabel: 'OpenAI',
    aliases: ['chatgpt', 'flagship'],
    description: 'Flagship OpenAI model',
  },
  {
    id: 'claude-sonnet-4.5',
    name: 'Claude Sonnet 4.5',
    provider: 'anthropic',
    providerLabel: 'Anthropic',
    providerSlug: 'anthropic',
    aliases: ['sonnet'],
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'google',
    providerLabel: 'Google',
  },
] as const satisfies readonly ModelSelectorModel[];

describe('model selector helpers', () => {
  it('builds search text from model metadata', () => {
    expect(createModelSelectorSearchValue(models[0])).toContain('gpt-4.1');
    expect(createModelSelectorSearchValue(models[0])).toContain('GPT-4.1');
    expect(createModelSelectorSearchValue(models[0])).toContain('openai');
    expect(createModelSelectorSearchValue(models[0])).toContain('OpenAI');
    expect(createModelSelectorSearchValue(models[0])).toContain('Flagship OpenAI model');
    expect(createModelSelectorSearchValue(models[0])).toContain('chatgpt');
  });

  it('filters with case-insensitive substring and ordered-character fuzzy matching', () => {
    const openAiValue = createModelSelectorSearchValue(models[0]);
    const anthropicValue = createModelSelectorSearchValue(models[1]);

    expect(modelSelectorFuzzyFilter(openAiValue, 'gpt')).toBe(true);
    expect(modelSelectorFuzzyFilter(openAiValue, 'OPENAI flagship')).toBe(true);
    expect(modelSelectorFuzzyFilter(anthropicValue, 'cl sn')).toBe(true);
    expect(modelSelectorFuzzyFilter(anthropicValue, 'google')).toBe(false);
  });

  it('groups models by provider while preserving first-seen order', () => {
    expect(groupModelSelectorModels(models)).toEqual([
      { provider: 'openai', heading: 'OpenAI', models: [models[0]] },
      { provider: 'anthropic', heading: 'Anthropic', models: [models[1]] },
      { provider: 'google', heading: 'Google', models: [models[2]] },
    ]);
  });
});

@Component({
  imports: [
    HlmButton,
    ModelSelector,
    ModelSelectorContent,
    ModelSelectorEmpty,
    ModelSelectorGroup,
    ModelSelectorInput,
    ModelSelectorItem,
    ModelSelectorList,
    ModelSelectorLogo,
    ModelSelectorName,
    ModelSelectorShortcut,
    ModelSelectorTrigger,
  ],
  template: `
    <ai-model-selector
      class="custom-selector"
      [open]="open()"
      (openChange)="open.set($event)"
    >
      <button aiModelSelectorTrigger hlmBtn variant="outline" class="custom-trigger">
        <ai-model-selector-logo provider="openai" />
        <ai-model-selector-name>GPT-4.1</ai-model-selector-name>
      </button>

      <ai-model-selector-content class="custom-content" title="Choose a model">
        <ai-model-selector-input inputId="model-search" placeholder="Search models..." />
        <ai-model-selector-list>
          <ai-model-selector-empty>No models found.</ai-model-selector-empty>
          @for (group of groups(); track group.provider) {
            <ai-model-selector-group [heading]="group.heading">
              @for (model of group.models; track model.id) {
                <button
                  aiModelSelectorItem
                  class="custom-item"
                  [value]="searchValue(model)"
                  [disabled]="model.disabled"
                  (selected)="selectedModelId.set(model.id)"
                >
                  <ai-model-selector-logo [provider]="model.providerSlug ?? model.provider" />
                  <ai-model-selector-name>{{ model.name }}</ai-model-selector-name>
                  @if (model.shortcut; as shortcut) {
                    <ai-model-selector-shortcut>{{ shortcut }}</ai-model-selector-shortcut>
                  }
                </button>
              }
            </ai-model-selector-group>
          }
        </ai-model-selector-list>
      </ai-model-selector-content>
    </ai-model-selector>
  `,
})
class Host {
  readonly open = signal(false);
  readonly selectedModelId = signal<string | undefined>(undefined);
  readonly models = signal<readonly ModelSelectorModel[]>([
    {
      id: 'gpt-4.1',
      name: 'GPT-4.1',
      provider: 'openai',
      providerLabel: 'OpenAI',
      shortcut: 'M1',
    },
    {
      id: 'claude-sonnet-4.5',
      name: 'Claude Sonnet 4.5',
      provider: 'anthropic',
      providerLabel: 'Anthropic',
    },
    {
      id: 'gemini-2.5-pro',
      name: 'Gemini 2.5 Pro',
      provider: 'google',
      providerLabel: 'Google',
      disabled: true,
    },
  ]);
  readonly groups = computed(() => groupModelSelectorModels(this.models()));

  searchValue(model: ModelSelectorModel): string {
    return createModelSelectorSearchValue(model);
  }
}

@Component({
  imports: [ModelSelectorContent],
  template: '<ai-model-selector-content />',
})
class OrphanContentHost {}

function getDialogContent(): HTMLElement {
  const content = document.body.querySelector<HTMLElement>('[data-slot="model-selector-content"]');

  if (!content) {
    throw new Error('Expected model selector dialog content to be open');
  }

  return content;
}

function createKeyboardEvent(type: string, key: string, keyCode: number): KeyboardEvent {
  const event = new KeyboardEvent(type, { bubbles: true, key });

  Object.defineProperty(event, 'keyCode', { value: keyCode });

  return event;
}

async function settle(fixture: ComponentFixture<Host>): Promise<void> {
  fixture.detectChanges();
  await fixture.whenStable();
  await new Promise((resolve) => globalThis.setTimeout(resolve));
  fixture.detectChanges();
}

describe('ModelSelector', () => {
  let fixture: ComponentFixture<Host>;
  let originalScrollIntoView: typeof HTMLElement.prototype.scrollIntoView | undefined;

  beforeEach(async () => {
    originalScrollIntoView = HTMLElement.prototype.scrollIntoView;
    HTMLElement.prototype.scrollIntoView = vi.fn();
    document.body.querySelectorAll('.cdk-overlay-container').forEach((element) => element.remove());

    await TestBed.configureTestingModule({
      imports: [Host],
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    await settle(fixture);
  });

  afterEach(() => {
    if (originalScrollIntoView) {
      HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
    } else {
      delete (
        HTMLElement.prototype as { scrollIntoView?: typeof HTMLElement.prototype.scrollIntoView }
      ).scrollIntoView;
    }
  });

  it('renders a real trigger button and preserves HLM and custom classes', () => {
    const trigger = fixture.nativeElement.querySelector(
      'button[aimodelselectortrigger]',
    ) as HTMLButtonElement | null;

    expect(trigger?.type).toBe('button');
    expect(trigger?.classList).toContain('custom-trigger');
    expect(trigger?.classList).toContain('group/button');
    expect(trigger?.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger?.textContent).toContain('GPT-4.1');
  });

  it('opens controlled dialog content from the trigger', async () => {
    const trigger = fixture.nativeElement.querySelector(
      'button[aimodelselectortrigger]',
    ) as HTMLButtonElement;

    trigger.click();
    await settle(fixture);

    const content = getDialogContent();

    expect(fixture.componentInstance.open()).toBe(true);
    expect(content.classList).toContain('custom-content');
    expect(content.textContent).toContain('Choose a model');
    expect(content.querySelector('#model-search')?.getAttribute('role')).toBe('combobox');
    expect(content.querySelector('#model-search')?.getAttribute('placeholder')).toBe(
      'Search models...',
    );
    expect(content.querySelector('[role="listbox"]')).not.toBeNull();
  });

  it('renders grouped options, selected state, shortcuts, and disabled state', async () => {
    fixture.componentInstance.open.set(true);
    await settle(fixture);

    const content = getDialogContent();
    const options = content.querySelectorAll<HTMLButtonElement>('[role="option"]');

    expect(content.textContent).toContain('OpenAI');
    expect(content.textContent).toContain('Anthropic');
    expect(content.textContent).toContain('M1');
    expect(options.length).toBe(3);
    expect(options[0]?.classList).toContain('custom-item');
    expect(options[0]?.getAttribute('data-value')).toContain('gpt-4.1');
    expect(options[2]?.hasAttribute('disabled')).toBe(true);
  });

  it('filters items through the search input and renders the empty state', async () => {
    fixture.componentInstance.open.set(true);
    await settle(fixture);

    const content = getDialogContent();
    const input = content.querySelector<HTMLInputElement>('#model-search');

    input!.value = 'no matching model';
    input!.dispatchEvent(new Event('input'));
    await settle(fixture);

    expect(content.textContent).toContain('No models found.');
    expect(content.querySelectorAll('[role="option"]:not([data-hidden])').length).toBe(0);
  });

  it('emits selection from clicks and keyboard enter', async () => {
    fixture.componentInstance.open.set(true);
    await settle(fixture);

    let content = getDialogContent();
    const firstOption = content.querySelector<HTMLButtonElement>('[role="option"]');

    firstOption!.click();
    await settle(fixture);

    expect(fixture.componentInstance.selectedModelId()).toBe('gpt-4.1');

    fixture.componentInstance.selectedModelId.set(undefined);
    fixture.componentInstance.open.set(true);
    await settle(fixture);

    content = getDialogContent();
    const input = content.querySelector<HTMLInputElement>('#model-search');

    input!.dispatchEvent(createKeyboardEvent('keydown', 'ArrowDown', 40));
    input!.dispatchEvent(createKeyboardEvent('keydown', 'Enter', 13));
    await settle(fixture);

    expect(fixture.componentInstance.selectedModelId()).toBe('claude-sonnet-4.5');
  });

  it('renders provider logos from models.dev', async () => {
    fixture.componentInstance.open.set(true);
    await settle(fixture);

    const logo = getDialogContent().querySelector<HTMLImageElement>('img[alt="openai logo"]');

    expect(logo?.src).toContain('https://models.dev/logos/openai.svg');
    expect(logo?.width).toBe(12);
    expect(logo?.height).toBe(12);
    expect(logo?.classList).toContain('size-3');
    expect(logo?.classList).toContain('dark:invert');
    expect(logo?.classList).toContain('in-data-[theme=dark]:invert');
  });

  it('throws a clear error when dialog pieces are used outside the root', async () => {
    await TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [OrphanContentHost],
      })
      .compileComponents();

    expect(() => {
      const orphanFixture = TestBed.createComponent(OrphanContentHost);
      orphanFixture.detectChanges();
    }).toThrowError('Model selector components must be used within ModelSelector');
  });
});
