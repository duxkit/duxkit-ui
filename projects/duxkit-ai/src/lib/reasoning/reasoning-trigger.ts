import { Component, computed, inject, input } from '@angular/core';
import { Reasoning } from './reasoning';
import { BrnCollapsible, BrnCollapsibleTrigger } from '@spartan-ng/brain/collapsible';
import { twMerge } from 'tailwind-merge';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBrain, lucideChevronDown } from '@ng-icons/lucide';

@Component({
  selector: 'button[aiReasoningTrigger],ai-reasoning-trigger',
  imports: [NgIcon],
  providers: [provideIcons({ lucideBrain, lucideChevronDown })],
  hostDirectives: [{ directive: BrnCollapsibleTrigger, inputs: ['type'] }],
  host: {
    '[class]': 'classes()',
    '(click)': 'reasoning.disableAutoToggle()',
  },
  template: `
    <ng-content>
      <ng-icon name="lucideBrain" style="--ng-icon__size: 16px" />
      <span
        class="min-w-0 truncate text-left"
        [class.ai-reasoning-trigger-label-shimmer]="reasoning.isStreaming()"
      >
        {{ triggerLabel() }}
      </span>
      <ng-icon
        name="lucideChevronDown"
        class="transition-transform"
        style="--ng-icon__size: 16px"
        [class.rotate-180]="expanded()"
      />
    </ng-content>
  `,
  styles: `
    .ai-reasoning-trigger-label-shimmer {
      animation: ai-reasoning-trigger-label-shimmer 3.2s linear infinite;
      background-image: linear-gradient(
        90deg,
        currentColor 0%,
        color-mix(in oklab, currentColor 35%, white) 50%,
        currentColor 100%
      );
      background-size: 200% 100%;
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    @keyframes ai-reasoning-trigger-label-shimmer {
      from {
        background-position: 200% 0;
      }

      to {
        background-position: -200% 0;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .ai-reasoning-trigger-label-shimmer {
        animation: none;
        background-image: none;
        -webkit-text-fill-color: currentColor;
      }
    }
  `,
})
export class ReasoningTrigger {
  protected readonly reasoning = inject(Reasoning);
  private readonly collapsible = inject(BrnCollapsible);

  /** Additional classes merged onto the reasoning trigger button. */
  readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly expanded = this.collapsible.expanded;

  protected readonly triggerLabel = computed(() => {
    if (this.reasoning.isStreaming()) {
      return 'Thinking...';
    }

    const durationSeconds = this.reasoning.durationSeconds();

    if (durationSeconds === undefined) {
      return 'Thought';
    }

    if (durationSeconds < 60) {
      return `Thought for ${durationSeconds} ${durationSeconds === 1 ? 'second' : 'seconds'}`;
    }

    const durationMinutes = Math.round(durationSeconds / 60);

    return `Thought for ${durationMinutes} ${durationMinutes === 1 ? 'minute' : 'minutes'}`;
  });

  protected readonly classes = computed(() =>
    twMerge(
      'flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground',
      this.userClass(),
    ),
  );
}
