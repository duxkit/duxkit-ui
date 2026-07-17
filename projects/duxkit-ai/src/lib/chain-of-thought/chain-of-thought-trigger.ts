import { Component, computed, inject, input } from '@angular/core';
import { BrnCollapsible, BrnCollapsibleTrigger } from '@spartan-ng/brain/collapsible';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBrain, lucideChevronDown } from '@ng-icons/lucide';
import { twMerge } from 'tailwind-merge';
import { Shimmer } from 'duxkit-ai/shimmer';
import { ChainOfThought } from './chain-of-thought';

@Component({
  selector: 'button[aiChainOfThoughtTrigger]',
  imports: [NgIcon, Shimmer],
  providers: [provideIcons({ lucideBrain, lucideChevronDown })],
  hostDirectives: [{ directive: BrnCollapsibleTrigger, inputs: ['type'] }],
  host: {
    '[class]': 'classes()',
    '(click)': 'chainOfThought.disableAutoToggle()',
  },
  template: `
    <ng-content>
      <ng-icon name="lucideBrain" style="--ng-icon__size: 16px" />
      @if (chainOfThought.isStreaming()) {
        <span aiShimmer class="min-w-0 truncate text-left">
          {{ triggerLabel() }}
        </span>
      } @else {
        <span class="min-w-0 truncate text-left">
          {{ triggerLabel() }}
        </span>
      }
      <ng-icon
        name="lucideChevronDown"
        class="transition-transform"
        style="--ng-icon__size: 16px"
        [class.rotate-180]="expanded()"
      />
    </ng-content>
  `,
})
export class ChainOfThoughtTrigger {
  /** Additional classes merged onto the chain-of-thought trigger button. */
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
