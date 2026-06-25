import { Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCircleCheck,
  lucideCircleDashed,
  lucideDot,
  lucideImage,
  lucideLoaderCircle,
  lucideSearch,
} from '@ng-icons/lucide';
import { HlmIcon } from 'ai-sdk-angular/helm/icon';
import { twMerge } from 'tailwind-merge';

export type ChainOfThoughtStepStatus = 'complete' | 'active' | 'pending';

const statusClasses: Record<ChainOfThoughtStepStatus, string> = {
  active: 'text-foreground',
  complete: 'text-muted-foreground',
  pending: 'text-muted-foreground/50',
};

@Component({
  selector: '[aiChainOfThoughtStep],ai-chain-of-thought-step',
  imports: [HlmIcon, NgIcon],
  providers: [
    provideIcons({
      lucideCircleCheck,
      lucideCircleDashed,
      lucideDot,
      lucideImage,
      lucideLoaderCircle,
      lucideSearch,
    }),
  ],
  host: {
    '[class]': 'classes()',
    '[attr.data-status]': 'status()',
  },
  template: `
    <div class="relative mt-0.5 shrink-0">
      <ng-icon hlm size="sm" [name]="icon()" [class.animate-spin]="spinning()" />
      <div class="absolute top-7 bottom-0 left-1/2 -mx-px w-px bg-border"></div>
    </div>

    <div class="min-w-0 flex-1 space-y-2 overflow-hidden">
      @if (label() !== undefined) {
        <div>{{ label() }}</div>
      }

      @if (description() !== undefined) {
        <div class="text-muted-foreground text-xs">{{ description() }}</div>
      }

      <ng-content />
    </div>
  `,
})
export class ChainOfThoughtStep {
  public readonly icon = input('lucideDot');
  public readonly label = input<string | undefined>();
  public readonly description = input<string | undefined>();
  public readonly status = input<ChainOfThoughtStepStatus>('complete');
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly spinning = computed(() => this.icon() === 'lucideLoaderCircle');
  protected readonly classes = computed(() =>
    twMerge(
      'flex gap-2 text-sm motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-2',
      statusClasses[this.status()],
      this.userClass(),
    ),
  );
}
