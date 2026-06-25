import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import type { AiToolPart } from './tool';
import { Tool, ToolContent, ToolStatus, ToolTrigger } from './';

const outputPart: AiToolPart = {
  type: 'tool-getWeather',
  toolCallId: 'call-weather-1',
  state: 'output-available',
  input: {
    city: 'London',
    unit: 'celsius',
  },
  output: {
    city: 'London',
    unit: 'celsius',
    temperature: 24,
    condition: 'partly cloudy',
    source: 'storybook-fixture',
  },
};

const approvalPart: AiToolPart = {
  type: 'tool-getWeather',
  toolCallId: 'call-weather-2',
  state: 'approval-requested',
  input: {
    city: 'London',
    unit: 'celsius',
  },
  approval: {
    id: 'approval-weather-2',
  },
};

const meta: Meta = {
  title: 'Components/Tool',
  decorators: [
    moduleMetadata({
      imports: [Tool, ToolTrigger, ToolContent, ToolStatus],
    }),
  ],
  tags: ['autodocs'],
  args: {
    part: outputPart,
  },
  render: (args) => ({
    props: args,
    template: `
      <ai-tool class="w-[560px]" [part]="part" [expanded]="true">
        <button aiToolTrigger></button>
        <ai-tool-content />
      </ai-tool>
    `,
  }),
};

export default meta;
type Story = StoryObj;

export const OutputAvailable: Story = {};

export const ApprovalRequested: Story = {
  args: {
    part: approvalPart,
  },
};

export const IconStatus: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ai-tool class="w-[560px]" [part]="part" [expanded]="true">
        <button aiToolTrigger>
          <span class="flex min-w-0 flex-1 items-center gap-2">
            <span class="font-medium">Custom trigger</span>
            <ai-tool-status variant="icon" />
          </span>
        </button>
        <ai-tool-content />
      </ai-tool>
    `,
  }),
};
