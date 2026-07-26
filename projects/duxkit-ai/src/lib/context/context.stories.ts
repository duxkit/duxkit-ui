import { HlmButton } from '@duxkit-private/ui/helm/button';
import type { LanguageModelUsage } from 'ai';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import {
  Context,
  ContextCacheUsage,
  ContextContent,
  ContextContentBody,
  ContextContentFooter,
  ContextContentHeader,
  ContextInputUsage,
  ContextIcon,
  ContextOutputUsage,
  ContextPercentage,
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

const meta: Meta = {
  title: 'Components/Context',
  decorators: [
    moduleMetadata({
      imports: [
        Context,
        ContextCacheUsage,
        ContextContent,
        ContextContentBody,
        ContextContentFooter,
        ContextContentHeader,
        ContextInputUsage,
        ContextIcon,
        ContextOutputUsage,
        ContextPercentage,
        ContextReasoningUsage,
        ContextTrigger,
        HlmButton,
      ],
    }),
  ],
  tags: ['autodocs'],
  args: {
    maxTokens: 128_000,
    modelId: 'openai:gpt-4o-mini',
    usage,
    usedTokens: 40_000,
  },
  render: (args) => ({
    props: args,
    template: `
      <ai-context
        [usedTokens]="usedTokens"
        [maxTokens]="maxTokens"
        [usage]="usage"
        [modelId]="modelId"
      >
        <button aiContextTrigger hlmBtn variant="ghost" size="sm">
          <ai-context-percentage />
          <ai-context-icon />
        </button>
        <ai-context-content>
          <ai-context-content-header />
          <ai-context-content-body>
            <ai-context-input-usage />
            <ai-context-output-usage />
            <ai-context-reasoning-usage />
            <ai-context-cache-usage />
          </ai-context-content-body>
          <ai-context-content-footer />
        </ai-context-content>
      </ai-context>
    `,
  }),
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const CustomTrigger: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ai-context
        [usedTokens]="usedTokens"
        [maxTokens]="maxTokens"
        [usage]="usage"
        [modelId]="modelId"
      >
        <button aiContextTrigger hlmBtn variant="outline" size="sm">
          Context used
        </button>
        <ai-context-content>
          <ai-context-content-header />
          <ai-context-content-body>
            <ai-context-input-usage />
            <ai-context-output-usage />
            <ai-context-cache-usage />
          </ai-context-content-body>
          <ai-context-content-footer />
        </ai-context-content>
      </ai-context>
    `,
  }),
};
