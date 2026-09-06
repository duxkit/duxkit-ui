import { HlmButton } from '@duxkit-private/ui/helm/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCircleCheck, lucideCircleDashed, lucideLoaderCircle } from '@ng-icons/lucide';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
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
  ChainOfThoughtImageCaption,
  ChainOfThoughtImageFrame,
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
  ChainOfThoughtStepDescription,
  ChainOfThoughtStepIcon,
  ChainOfThoughtStepLabel,
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
        ChainOfThoughtImageFrame,
        ChainOfThoughtImageCaption,
        ChainOfThoughtSearchResult,
        ChainOfThoughtSearchResults,
        ChainOfThoughtStep,
        ChainOfThoughtStepDescription,
        ChainOfThoughtStepIcon,
        ChainOfThoughtStepLabel,
        ChainOfThoughtTrigger,
        Confirmation,
        ConfirmationAction,
        ConfirmationActions,
        ConfirmationRequest,
        ConfirmationTitle,
        HlmButton,
        NgIcon,
      ],
      providers: [provideIcons({ lucideCircleCheck, lucideCircleDashed, lucideLoaderCircle })],
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
          <ai-chain-of-thought-step status="complete">
            <ai-chain-of-thought-step-icon>
              <ng-icon name="lucideCircleCheck" />
            </ai-chain-of-thought-step-icon>
            <ai-chain-of-thought-step-label>Parsed the request</ai-chain-of-thought-step-label>
            <ai-chain-of-thought-step-description>
              Identified the Angular components needed for the response.
            </ai-chain-of-thought-step-description>
          </ai-chain-of-thought-step>

          <ai-chain-of-thought-step status="active">
            <ai-chain-of-thought-step-icon>
              <ng-icon name="lucideLoaderCircle" class="animate-spin" />
            </ai-chain-of-thought-step-icon>
            <ai-chain-of-thought-step-label>Checked relevant sources</ai-chain-of-thought-step-label>
            <ai-chain-of-thought-step-description>
              Collected the component API shape and matching usage patterns.
            </ai-chain-of-thought-step-description>
            <ai-chain-of-thought-search-results>
              <span aiChainOfThoughtSearchResult>AI Elements</span>
              <span aiChainOfThoughtSearchResult>Angular signals</span>
              <span aiChainOfThoughtSearchResult>Spartan collapsible</span>
            </ai-chain-of-thought-search-results>
          </ai-chain-of-thought-step>

          <ai-chain-of-thought-step status="active">
            <ai-chain-of-thought-step-icon>
              <ng-icon name="lucideCircleDashed" />
            </ai-chain-of-thought-step-icon>
            <ai-chain-of-thought-step-label>Request permission</ai-chain-of-thought-step-label>
            <ai-chain-of-thought-step-description>
              Ask before running the tool that changes user data.
            </ai-chain-of-thought-step-description>
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

          <ai-chain-of-thought-step status="pending">
            <ai-chain-of-thought-step-icon>
              <ng-icon name="lucideCircleDashed" />
            </ai-chain-of-thought-step-icon>
            <ai-chain-of-thought-step-label>Generate final answer</ai-chain-of-thought-step-label>
            <ai-chain-of-thought-step-description>
              Prepare a concise implementation summary for the user.
            </ai-chain-of-thought-step-description>
          </ai-chain-of-thought-step>

          <ai-chain-of-thought-image>
            <div aiChainOfThoughtImageFrame><div class="flex h-32 w-full items-center justify-center rounded-md border border-border bg-background text-muted-foreground text-sm">
              Preview
            </div></div>
            <ai-chain-of-thought-image-caption>
              Optional media preview attached to a thought step.
            </ai-chain-of-thought-image-caption>
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
          <ai-chain-of-thought-step status="complete" collapsedMaxHeight="120px">
            <ai-chain-of-thought-step-icon>
              <ng-icon name="lucideCircleCheck" />
            </ai-chain-of-thought-step-icon>
            <ai-chain-of-thought-step-label>Reasoning</ai-chain-of-thought-step-label>
            <ai-chain-of-thought-step-description>
              Long reasoning can be collapsed to keep the message compact.
            </ai-chain-of-thought-step-description>
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
            collapsedMaxHeight="120px"
            [pinToBottom]="true"
          >
            <ai-chain-of-thought-step-icon>
              <ng-icon name="lucideLoaderCircle" class="animate-spin" />
            </ai-chain-of-thought-step-icon>
            <ai-chain-of-thought-step-label>Streaming reasoning</ai-chain-of-thought-step-label>
            <ai-chain-of-thought-step-description>
              When pinned, the clamped viewport follows the newest generated text.
            </ai-chain-of-thought-step-description>
            <p class="m-0 leading-relaxed">{{ longThought }}</p>
            <p class="mt-2 mb-0 leading-relaxed">{{ longThought }}</p>
          </ai-chain-of-thought-step>
        </ai-chain-of-thought-content>
      </ai-chain-of-thought>
    `,
  }),
};
