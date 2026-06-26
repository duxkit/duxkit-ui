import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { Task, TaskContent, TaskItem, TaskItemFile, TaskTrigger } from './';

const meta: Meta = {
  title: 'Components/Task',
  decorators: [
    moduleMetadata({
      imports: [Task, TaskContent, TaskItem, TaskItemFile, TaskTrigger],
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
      <ai-task class="w-[560px]" [expanded]="expanded">
        <button aiTaskTrigger>Searched the workspace</button>
        <ai-task-content>
          <ai-task-item>
            Matched reasoning usage in <ai-task-item-file>reasoning-content.ts</ai-task-item-file>
          </ai-task-item>
          <ai-task-item>
            Checked chain UI patterns in <ai-task-item-file>chain-of-thought-step.ts</ai-task-item-file>
          </ai-task-item>
          <ai-task-item>
            Prepared the implementation plan for <ai-task-item-file>task/</ai-task-item-file>
          </ai-task-item>
        </ai-task-content>
      </ai-task>
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

export const CustomTrigger: Story = {
  render: () => ({
    template: `
      <ai-task class="w-[560px]">
        <button aiTaskTrigger>
          Custom task trigger
        </button>
        <ai-task-content>
          <div aiTaskItem>Consumers can project any trigger or item content.</div>
          <div aiTaskItem>File badge as attribute: <span aiTaskItemFile>app.html</span></div>
        </ai-task-content>
      </ai-task>
    `,
  }),
};
