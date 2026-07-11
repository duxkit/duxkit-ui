import { computed, Directive, effect, inject, input, signal } from '@angular/core';
import { BrnCollapsible } from '@spartan-ng/brain/collapsible';
import { twMerge } from 'tailwind-merge';

@Directive({
  selector: '[aiTask],ai-task',
  hostDirectives: [
    {
      directive: BrnCollapsible,
      inputs: ['expanded', 'disabled'],
      outputs: ['expandedChange'],
    },
  ],
  host: {
    '[class]': 'classes()',
  },
})
export class Task {
  /** Automatically expands while task activity is streaming and collapses when it finishes. */
  public readonly autoToggle = input<boolean>(true);
  /** Whether task activity is currently streaming. */
  public readonly isStreaming = input<boolean | undefined>();
  /** Additional classes merged onto the task root element. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  private readonly collapsible = inject(BrnCollapsible);
  private readonly manualOverride = signal(false);

  protected readonly shouldAutoToggle = computed(() => this.autoToggle() && !this.manualOverride());
  protected readonly classes = computed(() => twMerge('block w-full min-w-0', this.userClass()));

  constructor() {
    this.collapsible.expanded.set(true);

    effect(() => {
      const isStreaming = this.isStreaming();

      if (isStreaming === undefined || !this.shouldAutoToggle()) {
        return;
      }

      this.collapsible.expanded.set(isStreaming);
    });
  }

  public disableAutoToggle(): void {
    this.manualOverride.set(true);
  }
}
