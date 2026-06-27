import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import type { AiToolPart } from '../tool';
import {
  Confirmation,
  ConfirmationAccepted,
  ConfirmationAction,
  ConfirmationActions,
  ConfirmationRejected,
  ConfirmationRequest,
  ConfirmationTitle,
} from './';

const requestedPart: AiToolPart = {
  type: 'tool-getWeather',
  toolCallId: 'call-confirmation-1',
  state: 'approval-requested',
  input: {
    city: 'London',
    unit: 'celsius',
  },
  approval: {
    id: 'approval-confirmation-1',
  },
};

const acceptedPart: AiToolPart = {
  ...requestedPart,
  state: 'approval-responded',
  approval: {
    id: 'approval-confirmation-1',
    approved: true,
    reason: 'Approved from Storybook.',
  },
};

const rejectedPart: AiToolPart = {
  ...requestedPart,
  state: 'approval-responded',
  approval: {
    id: 'approval-confirmation-1',
    approved: false,
    reason: 'Rejected from Storybook.',
  },
};

const meta: Meta = {
  title: 'Components/Confirmation',
  decorators: [
    moduleMetadata({
      imports: [
        Confirmation,
        ConfirmationAccepted,
        ConfirmationAction,
        ConfirmationActions,
        ConfirmationRejected,
        ConfirmationRequest,
        ConfirmationTitle,
        HlmButtonDirective,
      ],
    }),
  ],
  tags: ['autodocs'],
  args: {
    part: requestedPart,
  },
  render: (args) => ({
    props: args,
    template: `
      <ai-confirmation class="w-[420px]" [part]="part">
        <ai-confirmation-request>
          <ai-confirmation-title />
          <p class="my-2 text-muted-foreground">
            Allow this tool to run with the generated input?
          </p>
          <ai-confirmation-actions>
            <button aiConfirmationAction hlmBtn variant="outline">Deny</button>
            <button aiConfirmationAction hlmBtn>Allow</button>
          </ai-confirmation-actions>
        </ai-confirmation-request>
        <ai-confirmation-accepted>
          <ai-confirmation-title />
        </ai-confirmation-accepted>
        <ai-confirmation-rejected>
          <ai-confirmation-title />
        </ai-confirmation-rejected>
      </ai-confirmation>
    `,
  }),
};

export default meta;
type Story = StoryObj;

export const Requested: Story = {};

export const Accepted: Story = {
  args: {
    part: acceptedPart,
  },
};

export const Rejected: Story = {
  args: {
    part: rejectedPart,
  },
};
