import { HlmButton } from '@duxkit-private/ui/helm/button';
import { HlmIconImports } from '@duxkit-private/ui/helm/icon';
import { provideIcons } from '@ng-icons/core';
import { lucidePlus } from '@ng-icons/lucide';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import {
  createModelSelectorSearchValue,
  groupModelSelectorModels,
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorDescription,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorGroupHeading,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorName,
  ModelSelectorTitle,
  ModelSelectorTrigger,
  type ModelSelectorModel,
} from '../model-selector';
import {
  PromptInput,
  PromptInputAddAttachment,
  PromptInputAttachments,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from './';

const models = [
  {
    id: 'gpt-4.1',
    name: 'GPT-4.1',
    provider: 'openai',
    providerLabel: 'OpenAI',
  },
  {
    id: 'claude-sonnet-4.5',
    name: 'Claude Sonnet 4.5',
    provider: 'anthropic',
    providerLabel: 'Anthropic',
  },
] as const satisfies readonly ModelSelectorModel[];

const modelGroups = groupModelSelectorModels(models);

const meta: Meta = {
  title: 'Components/Prompt Input',
  decorators: [
    moduleMetadata({
      imports: [
        HlmButton,
        HlmIconImports,
        ModelSelector,
        ModelSelectorContent,
        ModelSelectorDescription,
        ModelSelectorEmpty,
        ModelSelectorGroup,
        ModelSelectorGroupHeading,
        ModelSelectorInput,
        ModelSelectorItem,
        ModelSelectorList,
        ModelSelectorLogo,
        ModelSelectorName,
        ModelSelectorTitle,
        ModelSelectorTrigger,
        PromptInput,
        PromptInputAddAttachment,
        PromptInputAttachments,
        PromptInputSubmit,
        PromptInputTextarea,
        PromptInputToolbar,
        PromptInputTools,
        PromptInputButton,
      ],
      providers: [provideIcons({ lucidePlus })],
    }),
  ],
  tags: ['autodocs'],
  args: {
    status: 'ready',
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['ready', 'submitted', 'streaming', 'error'],
    },
  },
  render: (args) => ({
    props: {
      ...args,
      groups: modelGroups,
      searchValue: createModelSelectorSearchValue,
    },
    template: `
      <form aiPromptInput class="w-[640px]" [status]="status">
        <textarea aiPromptInputTextarea placeholder="Ask a question..."></textarea>
        <ai-prompt-input-attachments />
        <ai-prompt-input-toolbar>
          <ai-prompt-input-tools>
            <ai-model-selector>
              <button aiModelSelectorTrigger hlmBtn class="justify-between" variant="outline" size="sm">
                <ai-model-selector-logo provider="openai" />
                <ai-model-selector-name>GPT-4.1</ai-model-selector-name>
              </button>
              <ai-model-selector-content>
                <h2 aiModelSelectorTitle class="sr-only">Choose a model</h2>
                <p aiModelSelectorDescription class="sr-only">Search and select an AI model.</p>
                <ai-model-selector-input placeholder="Search models..." />
                <ai-model-selector-list>
                  <ai-model-selector-empty>No models found.</ai-model-selector-empty>
                  @for (group of groups; track group.provider) {
                    <ai-model-selector-group>
                      <ai-model-selector-group-heading>{{ group.heading }}</ai-model-selector-group-heading>
                      @for (model of group.models; track model.id) {
                        <button aiModelSelectorItem [value]="searchValue(model)">
                          <ai-model-selector-logo [provider]="!model.providerSlug ?? model.provider" />
                          <ai-model-selector-name>{{ model.name }}</ai-model-selector-name>
                        </button>
                      }
                    </ai-model-selector-group>
                  }
                </ai-model-selector-list>
              </ai-model-selector-content>
            </ai-model-selector>
            <button aiPromptInputAddAttachment hlmBtn variant="ghost" size="icon-sm"></button>
            <button aiPromptInputButton hlmBtn variant="ghost" size="icon-sm" aria-label="Search the web">
              <ng-icon hlm size="sm" name="lucidePlus" />
            </button>
          </ai-prompt-input-tools>
          <button aiPromptInputSubmit hlmBtn size="icon-sm"></button>
        </ai-prompt-input-toolbar>
      </form>
    `,
  }),
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const Streaming: Story = {
  args: {
    status: 'streaming',
  },
  render: (args) => ({
    props: {
      ...args,
      groups: modelGroups,
      searchValue: createModelSelectorSearchValue,
    },
    template: `
      <form aiPromptInput class="w-[640px]" [status]="status">
        <textarea aiPromptInputTextarea placeholder="Ask a question...">Draft a migration plan</textarea>
        <ai-prompt-input-toolbar>
          <ai-prompt-input-tools>
            <ai-model-selector>
              <button aiModelSelectorTrigger hlmBtn class="justify-between" variant="outline" size="sm">
                <ai-model-selector-logo provider="openai" />
                <ai-model-selector-name>GPT-4.1</ai-model-selector-name>
              </button>
              <ai-model-selector-content>
                <h2 aiModelSelectorTitle class="sr-only">Choose a model</h2>
                <p aiModelSelectorDescription class="sr-only">Search and select an AI model.</p>
                <ai-model-selector-input placeholder="Search models..." />
                <ai-model-selector-list>
                  <ai-model-selector-empty>No models found.</ai-model-selector-empty>
                  @for (group of groups; track group.provider) {
                    <ai-model-selector-group>
                      <ai-model-selector-group-heading>{{ group.heading }}</ai-model-selector-group-heading>
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
            <button aiPromptInputAddAttachment hlmBtn variant="ghost" size="icon-sm"></button>
          </ai-prompt-input-tools>
          <button aiPromptInputSubmit hlmBtn size="icon-sm"></button>
        </ai-prompt-input-toolbar>
      </form>
    `,
  }),
};
