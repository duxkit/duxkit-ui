import { computed, Directive, effect, inject, input, signal } from '@angular/core';
import { twMerge } from 'tailwind-merge';
import { BrnCollapsible } from '@spartan-ng/brain/collapsible';

@Directive({
  selector: '[aiReasoning],ai-reasoning',
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
export class Reasoning {
  /** Automatically expands while reasoning is streaming and collapses when it finishes. */
  public readonly autoToggle = input<boolean>(true);
  /** Whether reasoning content is currently streaming. */
  public readonly isStreaming = input<boolean>(false);
  /** Additional classes merged onto the reasoning root element. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });
  protected readonly classes = computed(() => twMerge('flex flex-col', this.userClass()));

  private readonly collapsible = inject(BrnCollapsible);
  private readonly manualOverride = signal(false);
  private readonly startedAt = signal<number | null>(null);
  private readonly endedAt = signal<number | null>(null);
  private wasStreaming = false;

  public readonly durationSeconds = computed(() => {
    const startedAt = this.startedAt();
    const endedAt = this.endedAt();

    if (startedAt === null || endedAt === null) {
      return undefined;
    }

    return Math.max(0, Math.round((endedAt - startedAt) / 1000));
  });

  protected readonly shouldAutoToggle = computed(() => this.autoToggle() && !this.manualOverride());

  constructor() {
    effect(() => {
      const isStreaming = this.isStreaming();

      if (isStreaming && !this.wasStreaming) {
        this.startedAt.set(Date.now());
        this.endedAt.set(null);
      }

      if (!isStreaming && this.wasStreaming) {
        this.endedAt.set(Date.now());
      }

      this.wasStreaming = isStreaming;

      if (!this.shouldAutoToggle()) {
        return;
      }

      this.collapsible.expanded.set(isStreaming);
    });
  }

  public disableAutoToggle(): void {
    this.manualOverride.set(true);
  }
}
