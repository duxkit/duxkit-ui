import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { HlmButton } from '@duxkit/ui/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTrash } from '@ng-icons/lucide';
import {
  Queue,
  QueueItem,
  QueueItemAction,
  QueueItemActions,
  QueueItemAttachment,
  QueueItemContent,
  QueueItemDescription,
  QueueItemFile,
  QueueItemImage,
  QueueItemIndicator,
  QueueList,
  QueueSection,
  QueueSectionContent,
  QueueSectionCount,
  QueueSectionLabel,
  QueueSectionTrigger,
} from './';

const meta: Meta = {
  title: 'Components/Queue',
  decorators: [
    moduleMetadata({
      imports: [
        Queue,
        QueueItem,
        QueueItemAction,
        QueueItemActions,
        QueueItemAttachment,
        QueueItemContent,
        QueueItemDescription,
        QueueItemFile,
        QueueItemImage,
        QueueItemIndicator,
        QueueList,
        QueueSection,
        QueueSectionContent,
        QueueSectionCount,
        QueueSectionLabel,
        QueueSectionTrigger,
        HlmButton,
        NgIcon,
      ],
      providers: [provideIcons({ lucideTrash })],
    }),
  ],
  tags: ['autodocs'],
  args: {
    expanded: true,
  },
  argTypes: {
    expanded: {
      control: 'boolean',
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <ai-queue class="w-[560px]">
        <ai-queue-section [expanded]="expanded">
          <button aiQueueSectionTrigger>
            <ai-queue-section-label>
              <span aiQueueSectionCount>3</span>
              <span>queued tasks</span>
            </ai-queue-section-label>
          </button>
          <ai-queue-section-content>
            <ai-queue-list>
              <ai-queue-item>
                <div class="flex items-start gap-3">
                  <span aiQueueItemIndicator></span>
                  <span aiQueueItemContent>Search the workspace for queue-related APIs</span>
                  <span aiQueueItemActions>
                    <button
                      aiQueueItemAction
                      hlmBtn
                      variant="outline"
                      size="icon-xs"
                      aria-label="Remove search task"
                    >
                      <ng-icon name="lucideTrash" />
                    </button>
                  </span>
                </div>
                <ai-queue-item-description>
                  Inspect existing task and reasoning primitives.
                </ai-queue-item-description>
              </ai-queue-item>

              <ai-queue-item>
                <div class="flex items-start gap-3">
                  <span aiQueueItemIndicator></span>
                  <span aiQueueItemContent>Attach the generated plan to the next message</span>
                </div>
                <ai-queue-item-attachment>
                  <ai-queue-item-file>implementation-plan.md</ai-queue-item-file>
                </ai-queue-item-attachment>
              </ai-queue-item>

              <ai-queue-item>
                <div class="flex items-start gap-3">
                  <span aiQueueItemIndicator [completed]="true"></span>
                  <span aiQueueItemContent [completed]="true">Validate public exports</span>
                </div>
                <ai-queue-item-description [completed]="true">
                  Confirm docs metadata can discover every piece.
                </ai-queue-item-description>
              </ai-queue-item>
            </ai-queue-list>
          </ai-queue-section-content>
        </ai-queue-section>
      </ai-queue>
    `,
  }),
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const Collapsed: Story = {
  args: {
    expanded: false,
  },
};

export const WithAttachments: Story = {
  render: () => ({
    template: `
      <ai-queue class="w-[560px]">
        <ai-queue-section>
          <button aiQueueSectionTrigger>
            <ai-queue-section-label>
              <span aiQueueSectionCount>2</span>
              <span>message drafts</span>
            </ai-queue-section-label>
          </button>
          <ai-queue-section-content>
            <ai-queue-list>
              <ai-queue-item>
                <div class="flex items-start gap-3">
                  <span aiQueueItemIndicator></span>
                  <span aiQueueItemContent>Summarize the uploaded screenshot</span>
                </div>
                <ai-queue-item-attachment>
                  <img
                    aiQueueItemImage
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=64&q=80"
                    alt="Dashboard screenshot thumbnail"
                  />
                  <ai-queue-item-file>workspace-notes.md</ai-queue-item-file>
                </ai-queue-item-attachment>
              </ai-queue-item>
            </ai-queue-list>
          </ai-queue-section-content>
        </ai-queue-section>
      </ai-queue>
    `,
  }),
};
