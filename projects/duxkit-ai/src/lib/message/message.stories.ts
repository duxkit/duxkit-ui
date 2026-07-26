import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { HlmButton } from '@duxkit-private/ui/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideThumbsDown, lucideThumbsUp } from '@ng-icons/lucide';
import {
  MessageActions,
  MessageContent,
  MessageCopy,
  MessageThumbsDown,
  MessageThumbsUp,
} from './';
import { Message } from './message';

const meta: Meta = {
  title: 'Components/Message',
  decorators: [
    moduleMetadata({
      imports: [
        HlmButton,
        Message,
        MessageActions,
        MessageContent,
        MessageCopy,
        MessageThumbsDown,
        MessageThumbsUp,
        NgIcon,
      ],
      providers: [provideIcons({ lucideThumbsDown, lucideThumbsUp })],
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
            <button aiMessageCopy hlmBtn size="icon-sm" variant="ghost" aria-label="Copy message"></button>
            <button aiMessageThumbsUp hlmBtn size="icon-sm" variant="ghost" aria-label="Good response">
              <ng-icon name="lucideThumbsUp" />
            </button>
            <button aiMessageThumbsDown hlmBtn size="icon-sm" variant="ghost" aria-label="Bad response">
              <ng-icon name="lucideThumbsDown" />
            </button>
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
