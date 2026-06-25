import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtImage,
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
  ChainOfThoughtTrigger,
} from './';

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
    props: args,
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
