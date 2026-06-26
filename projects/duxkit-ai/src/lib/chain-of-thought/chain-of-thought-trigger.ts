import { Component, computed, inject, input } from '@angular/core';
import { BrnCollapsible, BrnCollapsibleTrigger } from '@spartan-ng/brain/collapsible';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBrain, lucideChevronDown } from '@ng-icons/lucide';
import { HlmIcon } from 'duxkit-ai/helm/icon';
import { twMerge } from 'tailwind-merge';
import { ChainOfThought } from './chain-of-thought';

@Component({
  selector: 'button[aiChainOfThoughtTrigger],ai-chain-of-thought-trigger',
  imports: [HlmIcon, NgIcon],
  providers: [provideIcons({ lucideBrain, lucideChevronDown })],
  hostDirectives: [{ directive: BrnCollapsibleTrigger, inputs: ['type'] }],
  host: {
    '[class]': 'classes()',
    '(click)': 'chainOfThought.disableAutoToggle()',
  },
  template: `
    <ng-icon hlm size="sm" name="lucideBrain" />
    <span class="min-w-0 truncate text-left">
      <ng-content>{{ triggerLabel() }}</ng-content>
    </span>
    <ng-icon
      hlm
      size="sm"
      name="lucideChevronDown"
      class="transition-transform"
      [class.rotate-180]="expanded()"
    />
  `,
})
export class ChainOfThoughtTrigger {
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly chainOfThought = inject(ChainOfThought);
  private readonly collapsible = inject(BrnCollapsible);

  protected readonly expanded = this.collapsible.expanded;
  protected readonly triggerLabel = computed(() => {
    if (this.chainOfThought.isStreaming()) {
      return 'Thinking...';
    }

    const durationSeconds = this.chainOfThought.durationSeconds();

    if (durationSeconds === undefined) {
      return 'Chain of Thought';
    }

    if (durationSeconds < 60) {
      return `Thought for ${durationSeconds} ${durationSeconds === 1 ? 'second' : 'seconds'}`;
    }

    const durationMinutes = Math.round(durationSeconds / 60);

    return `Thought for ${durationMinutes} ${durationMinutes === 1 ? 'minute' : 'minutes'}`;
  });

  protected readonly classes = computed(() =>
    twMerge(
      'flex w-full items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground',
      this.userClass(),
    ),
  );
}
