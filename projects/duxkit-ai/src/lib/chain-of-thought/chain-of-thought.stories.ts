import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import {
  Confirmation,
  ConfirmationAction,
  ConfirmationActions,
  ConfirmationRequest,
  ConfirmationTitle,
} from '../confirmation';
import type { AiToolPart } from '../tool';
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtImage,
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
  ChainOfThoughtTrigger,
} from './';

const longThought = [
  'The model first separates the user request into intent, constraints, and current UI state.',
  'It then checks whether the answer should be represented as normal message content, a tool step, or a reasoning step.',
  'For a long internal trace, the component should keep the conversation readable by limiting the visible height.',
  'The fade overlay indicates that more content exists without introducing a nested scroll region.',
  'After the user expands the step, the full content remains inline so copy, selection, and normal document flow still work.',
  'Consumers can choose the exact clamp height depending on their layout density and target device size.',
].join(' ');

const approvalPart: AiToolPart = {
  type: 'tool-updateNotes',
  toolCallId: 'call-notes-1',
  state: 'approval-requested',
  input: {
    note: 'Add the selected restaurant and location to the user notes.',
  },
  approval: {
    id: 'approval-notes-1',
  },
};

const meta: Meta = {
  title: 'Components/Chain Of Thought',
  decorators: [
    moduleMetadata({
      imports: [
        ChainOfThought,
        ChainOfThoughtContent,
        ChainOfThoughtImage,
        ChainOfThoughtSearchResult,
        ChainOfThoughtSearchResults,
        ChainOfThoughtStep,
        ChainOfThoughtTrigger,
        Confirmation,
        ConfirmationAction,
        ConfirmationActions,
        ConfirmationRequest,
        ConfirmationTitle,
        HlmButtonDirective,
      ],
    }),
  ],
  tags: ['autodocs'],
  argTypes: {
    expanded: {
      control: 'boolean',
    },
    isStreaming: {
      control: 'boolean',
    },
  },
  args: {
    expanded: true,
    isStreaming: false,
  },
  render: (args) => ({
    props: {
      ...args,
      approvalPart,
    },
    template: `
      <ai-chain-of-thought
        class="w-[560px]"
        [expanded]="expanded"
        [autoToggle]="false"
        [isStreaming]="isStreaming"
      >
        <button aiChainOfThoughtTrigger></button>
        <ai-chain-of-thought-content>
          <ai-chain-of-thought-step
            status="complete"
            icon="lucideCircleCheck"
            label="Parsed the request"
            description="Identified the Angular components needed for the response."
          />

          <ai-chain-of-thought-step
            status="active"
            icon="lucideLoaderCircle"
            label="Checked relevant sources"
            description="Collected the component API shape and matching usage patterns."
          >
            <ai-chain-of-thought-search-results>
              <span aiChainOfThoughtSearchResult>AI Elements</span>
              <span aiChainOfThoughtSearchResult>Angular signals</span>
              <span aiChainOfThoughtSearchResult>Spartan collapsible</span>
            </ai-chain-of-thought-search-results>
          </ai-chain-of-thought-step>

          <ai-chain-of-thought-step
            status="active"
            icon="lucideCircleDashed"
            label="Request permission"
            description="Ask before running the tool that changes user data."
          >
            <ai-confirmation [part]="approvalPart">
              <ai-confirmation-request>
                <ai-confirmation-title />
                <p class="my-2 text-muted-foreground">
                  Allow this tool to add the selected place to notes?
                </p>
                <ai-confirmation-actions>
                  <button aiConfirmationAction hlmBtn variant="outline">Deny</button>
                  <button aiConfirmationAction hlmBtn>Allow</button>
                </ai-confirmation-actions>
              </ai-confirmation-request>
            </ai-confirmation>
          </ai-chain-of-thought-step>

          <ai-chain-of-thought-step
            status="pending"
            icon="lucideCircleDashed"
            label="Generate final answer"
            description="Prepare a concise implementation summary for the user."
          />

          <ai-chain-of-thought-image caption="Optional media preview attached to a thought step.">
            <div class="flex h-32 w-full items-center justify-center rounded-md border border-border bg-background text-muted-foreground text-sm">
              Preview
            </div>
          </ai-chain-of-thought-image>
        </ai-chain-of-thought-content>
      </ai-chain-of-thought>
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

export const ClampedStep: Story = {
  render: (args) => ({
    props: {
      ...args,
      longThought,
    },
    template: `
      <ai-chain-of-thought
        class="w-[560px]"
        [expanded]="true"
        [autoToggle]="false"
      >
        <button aiChainOfThoughtTrigger>Thought for 12 seconds</button>
        <ai-chain-of-thought-content>
          <ai-chain-of-thought-step
            status="complete"
            icon="lucideCircleCheck"
            label="Reasoning"
            description="Long reasoning can be collapsed to keep the message compact."
            collapsedMaxHeight="120px"
          >
            <p class="m-0 leading-relaxed">{{ longThought }}</p>
            <p class="mt-2 mb-0 leading-relaxed">{{ longThought }}</p>
          </ai-chain-of-thought-step>
        </ai-chain-of-thought-content>
      </ai-chain-of-thought>
    `,
  }),
};

export const PinnedClampedStep: Story = {
  render: (args) => ({
    props: {
      ...args,
      longThought,
    },
    template: `
      <ai-chain-of-thought
        class="w-[560px]"
        [expanded]="true"
        [autoToggle]="false"
        [isStreaming]="true"
      >
        <button aiChainOfThoughtTrigger></button>
        <ai-chain-of-thought-content>
          <ai-chain-of-thought-step
            status="active"
            icon="lucideLoaderCircle"
            label="Streaming reasoning"
            description="When pinned, the clamped viewport follows the newest generated text."
            collapsedMaxHeight="120px"
            [pinToBottom]="true"
          >
            <p class="m-0 leading-relaxed">{{ longThought }}</p>
            <p class="mt-2 mb-0 leading-relaxed">{{ longThought }}</p>
          </ai-chain-of-thought-step>
        </ai-chain-of-thought-content>
      </ai-chain-of-thought>
    `,
  }),
};
