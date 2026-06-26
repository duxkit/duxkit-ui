import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { MessageActions, MessageActionsCopy, MessageContent } from './';
import { Message } from './message';

const meta: Meta = {
  title: 'Components/Message',
  decorators: [
    moduleMetadata({
      imports: [Message, MessageContent, MessageActions, MessageActionsCopy],
    }),
  ],
  tags: ['autodocs'],
  argTypes: {
    from: {
      control: 'select',
      options: ['user', 'assistant', 'system'],
    },
  },
  args: {
    from: 'assistant',
    markdown:
      'Here is a response with **markdown** and a small code example.\n\n```ts\nconst message = \"Hello from AI SDK Angular\";\n```',
  },
  render: (args) => ({
    props: args,
    template: `
      <div class="w-[560px]">
        <ai-message [from]="from">
          <ai-message-content [markdown]="markdown" />
          <ai-message-actions>
            <ai-message-actions-copy />
          </ai-message-actions>
        </ai-message>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj;

export const Assistant: Story = {};

export const User: Story = {
  args: {
    from: 'user',
    markdown: 'Can you explain how tool approvals work?',
  },
};
