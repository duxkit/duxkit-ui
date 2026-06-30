import { HlmButton } from '@duxkit/ui/helm/button';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import {
  PromptInput,
  PromptInputAddAttachment,
  PromptInputAttachments,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from './';
import {
  createModelSelectorSearchValue,
  groupModelSelectorModels,
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorName,
  ModelSelectorTrigger,
  type ModelSelectorModel,
} from '../model-selector';

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
        ModelSelector,
        ModelSelectorContent,
        ModelSelectorEmpty,
        ModelSelectorGroup,
        ModelSelectorInput,
        ModelSelectorItem,
        ModelSelectorList,
        ModelSelectorLogo,
        ModelSelectorName,
        ModelSelectorTrigger,
        PromptInput,
        PromptInputAddAttachment,
        PromptInputAttachments,
        PromptInputSubmit,
        PromptInputTextarea,
        PromptInputToolbar,
        PromptInputTools,
      ],
    }),
  ],
  tags: ['autodocs'],
  render: () => ({
    props: {
      groups: modelGroups,
      searchValue: createModelSelectorSearchValue,
    },
    template: `
      <form aiPromptInput class="w-[640px]">
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
            <button aiPromptInputAddAttachment hlmBtn variant="ghost" size="icon-sm"></button>
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
  render: () => ({
    props: {
      groups: modelGroups,
      searchValue: createModelSelectorSearchValue,
    },
    template: `
      <form aiPromptInput class="w-[640px]" status="streaming">
        <textarea aiPromptInputTextarea placeholder="Ask a question...">Draft a migration plan</textarea>
        <ai-prompt-input-toolbar>
          <ai-prompt-input-tools>
            <ai-model-selector>
              <button aiModelSelectorTrigger hlmBtn class="justify-between" variant="outline" size="sm">
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
                        </button>
                      }
                    </ai-model-selector-group>
                  }
                </ai-model-selector-list>
              </ai-model-selector-content>
            </ai-model-selector>
            <button aiPromptInputAddAttachment hlmBtn variant="ghost" size="icon-sm"></button>
          </ai-prompt-input-tools>
          <button aiPromptInputSubmit hlmBtn size="icon-sm" status="streaming"></button>
        </ai-prompt-input-toolbar>
      </form>
    `,
  }),
};
