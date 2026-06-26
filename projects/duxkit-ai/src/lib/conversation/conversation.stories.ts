import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { Message, MessageContent } from '../message';
import { Conversation, ConversationContent, ConversationScrollAnchor } from './';

const meta: Meta = {
  title: 'Components/Conversation',
  decorators: [
    moduleMetadata({
      imports: [
        Conversation,
        ConversationContent,
        ConversationScrollAnchor,
        Message,
        MessageContent,
      ],
    }),
  ],
  tags: ['autodocs'],
  render: () => ({
    template: `
      <ai-conversation class="h-[420px] w-[640px] rounded-lg border border-border bg-background">
        <ai-conversation-content class="space-y-3 p-4">
          <ai-message from="user">
            <ai-message-content>Show me the latest weather for London.</ai-message-content>
          </ai-message>
          <ai-message from="assistant">
            <ai-message-content [markdown]="assistantMessage" />
          </ai-message>
          <ai-message from="user">
            <ai-message-content>Can you include the tool output?</ai-message-content>
          </ai-message>
          <ai-message from="assistant">
            <ai-message-content [markdown]="toolMessage" />
          </ai-message>
          <div aiConversationScrollAnchor></div>
        </ai-conversation-content>
      </ai-conversation>
    `,
    props: {
      assistantMessage:
        'London is partly cloudy today. I can call the weather tool if you want a deterministic test result.',
      toolMessage: 'The test tool returned `24°C`, partly cloudy, from `playground-test-tool`.',
    },
  }),
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};
