import { HlmButton } from '@duxkit/ui/helm/button';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
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
  type ModelSelectorModel,
} from './';

const modelSelectorModels = [
  {
    id: 'gpt-4.1',
    name: 'GPT-4.1',
    provider: 'openai',
    providerLabel: 'OpenAI',
    shortcut: 'M1',
  },
  {
    id: 'gpt-4.1-mini',
    name: 'GPT-4.1 Mini',
    provider: 'openai',
    providerLabel: 'OpenAI',
  },
  {
    id: 'claude-sonnet-4.5',
    name: 'Claude Sonnet 4.5',
    provider: 'anthropic',
    providerLabel: 'Anthropic',
    shortcut: 'M2',
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'google',
    providerLabel: 'Google',
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: 'mistral',
    providerLabel: 'Mistral',
  },
] as const satisfies readonly ModelSelectorModel[];

const modelSelectorGroups = groupModelSelectorModels(modelSelectorModels);

const meta: Meta = {
  title: 'Components/Model Selector',
  decorators: [
    moduleMetadata({
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
    }),
  ],
  tags: ['autodocs'],
  render: () => ({
    props: {
      groups: modelSelectorGroups,
      searchValue: createModelSelectorSearchValue,
    },
    template: `
      <ai-model-selector>
        <button aiModelSelectorTrigger hlmBtn class="justify-between" variant="outline">
          <ai-model-selector-logo provider="openai" />
          <ai-model-selector-name>GPT-4.1</ai-model-selector-name>
        </button>
        <ai-model-selector-content>
          <ai-model-selector-input placeholder="Search models..." />
          <ai-model-selector-list>
            <ai-model-selector-empty>No models found.</ai-model-selector-empty>
            @for (group of groups; track group.provider) {
              <ai-model-selector-group [heading]="group.heading">
                @for (model of group.models; track model.id) {
                  <button aiModelSelectorItem [value]="searchValue(model)">
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
  }),
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const SelectedTrigger: Story = {
  render: () => ({
    props: {
      groups: modelSelectorGroups,
      searchValue: createModelSelectorSearchValue,
    },
    template: `
      <ai-model-selector>
        <button aiModelSelectorTrigger hlmBtn class="justify-between" variant="outline">
          <ai-model-selector-logo provider="anthropic" />
          <ai-model-selector-name>Claude Sonnet 4.5</ai-model-selector-name>
        </button>
        <ai-model-selector-content>
          <ai-model-selector-input placeholder="Search models..." />
          <ai-model-selector-list>
            <ai-model-selector-empty>No models found.</ai-model-selector-empty>
            @for (group of groups; track group.provider) {
              <ai-model-selector-group [heading]="group.heading">
                @for (model of group.models; track model.id) {
                  <button aiModelSelectorItem [value]="searchValue(model)">
                    <ai-model-selector-logo [provider]="model.providerSlug ?? model.provider" />
                    <ai-model-selector-name>{{ model.name }}</ai-model-selector-name>
                  </button>
                }
              </ai-model-selector-group>
            }
          </ai-model-selector-list>
        </ai-model-selector-content>
      </ai-model-selector>
    `,
  }),
};

export const EmptyState: Story = {
  render: () => ({
    template: `
      <ai-model-selector>
        <button aiModelSelectorTrigger hlmBtn class="justify-between" variant="outline">
          <ai-model-selector-name>Select model</ai-model-selector-name>
        </button>
        <ai-model-selector-content>
          <ai-model-selector-input placeholder="Search models..." />
          <ai-model-selector-list>
            <ai-model-selector-empty>No models found.</ai-model-selector-empty>
          </ai-model-selector-list>
        </ai-model-selector-content>
      </ai-model-selector>
    `,
  }),
};

export const Shortcuts: Story = {
  render: () => ({
    props: {
      groups: modelSelectorGroups,
      searchValue: createModelSelectorSearchValue,
    },
    template: `
      <ai-model-selector>
        <button aiModelSelectorTrigger hlmBtn class="justify-between" variant="outline">
          <ai-model-selector-logo provider="openai" />
          <ai-model-selector-name>GPT-4.1</ai-model-selector-name>
        </button>
        <ai-model-selector-content>
          <ai-model-selector-input placeholder="Search models..." />
          <ai-model-selector-list>
            <ai-model-selector-empty>No models found.</ai-model-selector-empty>
            @for (group of groups; track group.provider) {
              <ai-model-selector-group [heading]="group.heading">
                @for (model of group.models; track model.id) {
                  <button aiModelSelectorItem [value]="searchValue(model)">
                    <ai-model-selector-logo [provider]="model.providerSlug ?? model.provider" />
                    <ai-model-selector-name>{{ model.name }}</ai-model-selector-name>
                    <ai-model-selector-shortcut>{{ model.shortcut ?? 'M-' }}</ai-model-selector-shortcut>
                  </button>
                }
              </ai-model-selector-group>
            }
          </ai-model-selector-list>
        </ai-model-selector-content>
      </ai-model-selector>
    `,
  }),
};
