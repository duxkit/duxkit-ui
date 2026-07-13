import { HlmButton } from '@duxkit-private/ui/helm/button';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ReasoningEffortImports, type ReasoningEffortLevel } from './';

const describedLevels = [
  { value: 'low', label: 'Low', description: 'Faster responses with light reasoning.' },
  { value: 'medium', label: 'Medium', description: 'A balance of speed and deliberation.' },
  { value: 'high', label: 'High', description: 'More time spent checking the response.' },
  { value: 'xhigh', label: 'Extra high', description: 'Deep analysis for difficult prompts.' },
  { value: 'max', label: 'Maximum', description: 'The strongest standard reasoning budget.' },
  { value: 'ultra', label: 'Ultra', description: 'The highest available reasoning budget.' },
] as const satisfies readonly ReasoningEffortLevel[];

const customLevels = [
  { value: 'fast', label: 'Quick' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'deliberate', label: 'Deliberate' },
] as const satisfies readonly ReasoningEffortLevel[];

const meta: Meta = {
  title: 'Components/Reasoning Effort',
  decorators: [
    moduleMetadata({
      imports: [HlmButton, ReasoningEffortImports],
    }),
  ],
  tags: ['autodocs'],
  render: () => ({
    props: {
      value: 'medium',
    },
    template: `
      <div class="flex flex-col items-start gap-3">
        <ai-reasoning-effort [value]="value" (valueChange)="value = $event">
          <button aiReasoningEffortTrigger></button>
          <ai-reasoning-effort-content>
            <div class="mb-4 flex items-center justify-between gap-4">
              <ai-reasoning-effort-label />
              <ai-reasoning-effort-value />
            </div>
            <ai-reasoning-effort-slider />
          </ai-reasoning-effort-content>
        </ai-reasoning-effort>
        <p class="text-sm text-muted-foreground">Selected value: {{ value }}</p>
      </div>
    `,
  }),
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const DropdownList: Story = {
  render: () => ({
    props: {
      levels: describedLevels,
      value: 'high',
    },
    template: `
      <ai-reasoning-effort
        [levels]="levels"
        [value]="value"
        (valueChange)="value = $event"
      >
        <button aiReasoningEffortTrigger></button>
        <ai-reasoning-effort-content>
          <div class="mb-2 flex items-center justify-between gap-4 px-2">
            <ai-reasoning-effort-label />
            <ai-reasoning-effort-value />
          </div>
          <ai-reasoning-effort-list />
        </ai-reasoning-effort-content>
      </ai-reasoning-effort>
    `,
  }),
};

export const CustomComposition: Story = {
  render: () => ({
    props: {
      levels: customLevels,
      value: 'balanced',
    },
    template: `
      <ai-reasoning-effort
        label="Thinking depth"
        [levels]="levels"
        [value]="value"
        (valueChange)="value = $event"
      >
        <button aiReasoningEffortTrigger hlmBtn variant="outline" size="sm">
          <span>Depth</span>
          <span aiReasoningEffortValue class="text-foreground"></span>
        </button>
        <ai-reasoning-effort-content class="w-72 p-2">
          <ai-reasoning-effort-list>
            @for (level of levels; track level.value) {
              <button
                aiReasoningEffortItem
                class="justify-between"
                [value]="level.value"
              >
                <span>{{ level.label }}</span>
              </button>
            }
          </ai-reasoning-effort-list>
        </ai-reasoning-effort-content>
      </ai-reasoning-effort>
    `,
  }),
};

export const CustomSliderStyling: Story = {
  render: () => ({
    template: `
      <ai-reasoning-effort>
        <button aiReasoningEffortTrigger></button>
        <ai-reasoning-effort-content>
          <ai-reasoning-effort-slider
            class="gap-5"
            trackClass="h-2"
            thumbClass="size-5"
            levelLabelClass="uppercase tracking-wide"
          />
        </ai-reasoning-effort-content>
      </ai-reasoning-effort>
    `,
  }),
};

export const Disabled: Story = {
  render: () => ({
    template: `
      <ai-reasoning-effort disabled>
        <button aiReasoningEffortTrigger></button>
        <ai-reasoning-effort-content>
          <ai-reasoning-effort-slider />
        </ai-reasoning-effort-content>
      </ai-reasoning-effort>
    `,
  }),
};
