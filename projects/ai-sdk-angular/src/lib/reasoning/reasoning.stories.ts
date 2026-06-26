import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { Reasoning, ReasoningContent, ReasoningTrigger } from './';

const reasoningMarkdown = `1. **Inspect the user request:** The user wants a UI component that shows model reasoning.
2. **Choose the rendering pattern:** Use a collapsible region so the main answer stays readable.
3. **Preserve streaming state:** Keep the trigger open while reasoning is streaming.`;

const longReasoningMarkdown = Array.from({ length: 8 }, (_, index) => {
  const step = index + 1;

  return `${step}. **Reasoning step ${step}:** The model reviews the request, checks the relevant component state, and keeps the reasoning content readable by collapsing long output behind a show more affordance.`;
}).join('\n');

const meta: Meta = {
  title: 'Components/Reasoning',
  decorators: [
    moduleMetadata({
      imports: [Reasoning, ReasoningTrigger, ReasoningContent],
    }),
  ],
  tags: ['autodocs'],
  argTypes: {
    isStreaming: {
      control: 'boolean',
    },
  },
  args: {
    isStreaming: false,
    markdown: reasoningMarkdown,
  },
  render: (args) => ({
    props: args,
    template: `
      <ai-reasoning class="w-[560px]" [isStreaming]="isStreaming" [expanded]="true">
        <button aiReasoningTrigger></button>
        <ai-reasoning-content [markdown]="markdown" />
      </ai-reasoning>
    `,
  }),
};

export default meta;
type Story = StoryObj;

export const Complete: Story = {};

export const Streaming: Story = {
  args: {
    isStreaming: true,
  },
};

export const Clamped: Story = {
  args: {
    markdown: longReasoningMarkdown,
  },
  render: (args) => ({
    props: args,
    template: `
      <ai-reasoning class="w-[560px]" [isStreaming]="false" [expanded]="true">
        <button aiReasoningTrigger>Thought for 14 seconds</button>
        <ai-reasoning-content [markdown]="markdown" collapsedMaxHeight="140px" />
      </ai-reasoning>
    `,
  }),
};
