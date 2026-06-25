import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { Reasoning, ReasoningContent, ReasoningTrigger } from './';

const reasoningMarkdown = `1. **Inspect the user request:** The user wants a UI component that shows model reasoning.
2. **Choose the rendering pattern:** Use a collapsible region so the main answer stays readable.
3. **Preserve streaming state:** Keep the trigger open while reasoning is streaming.`;

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
