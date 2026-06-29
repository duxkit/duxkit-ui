import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { Shimmer } from './';

const meta: Meta = {
  title: 'Components/Shimmer',
  decorators: [
    moduleMetadata({
      imports: [Shimmer],
    }),
  ],
  tags: ['autodocs'],
  render: () => ({
    template: `
      <p aiShimmer class="text-lg font-medium">
        Generating a response from the model...
      </p>
    `,
  }),
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const Heading: Story = {
  render: () => ({
    template: `
      <h2 aiShimmer class="text-2xl font-semibold" [duration]="1.6" [spread]="3">
        Reading context and drafting the answer
      </h2>
    `,
  }),
};

export const ElementSelector: Story = {
  render: () => ({
    template: `
      <ai-shimmer class="text-sm">
        Updating tool results...
      </ai-shimmer>
    `,
  }),
};
