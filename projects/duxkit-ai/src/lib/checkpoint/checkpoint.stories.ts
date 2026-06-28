import { HlmButton } from '@duxkit/ui/helm/button';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { Checkpoint, CheckpointIcon, CheckpointTrigger } from './';

const meta: Meta = {
  title: 'Components/Checkpoint',
  decorators: [
    moduleMetadata({
      imports: [Checkpoint, CheckpointIcon, CheckpointTrigger, HlmButton],
    }),
  ],
  tags: ['autodocs'],
  render: () => ({
    template: `
      <ai-checkpoint class="w-[720px]">
        <ai-checkpoint-icon />
        <button
          aiCheckpointTrigger
          hlmBtn
          variant="ghost"
          size="sm"
          ariaLabel="Restore to this checkpoint"
        >
          Restore checkpoint
        </button>
      </ai-checkpoint>
    `,
  }),
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const CustomMarker: Story = {
  render: () => ({
    template: `
      <ai-checkpoint class="w-[720px]">
        <span aiCheckpointIcon class="text-xs font-medium">v2</span>
        <button aiCheckpointTrigger hlmBtn variant="ghost" size="sm">
          Restore before file changes
        </button>
      </ai-checkpoint>
    `,
  }),
};
