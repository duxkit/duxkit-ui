import {
  booleanAttribute,
  computed,
  Directive,
  ElementRef,
  inject,
  input,
  model,
} from '@angular/core';
import { BrnPopover, provideBrnPopoverDefaultOptions } from '@spartan-ng/brain/popover';
import { twMerge } from 'tailwind-merge';
import {
  DEFAULT_REASONING_EFFORT_LEVELS,
  type ReasoningEffortLevel,
} from './reasoning-effort.types';

export const reasoningEffortClasses = 'not-prose inline-flex min-w-0';

@Directive({
  selector: 'ai-reasoning-effort,[aiReasoningEffort]',
  exportAs: 'aiReasoningEffort',
  providers: [provideBrnPopoverDefaultOptions({ role: null })],
  hostDirectives: [
    {
      directive: BrnPopover,
      inputs: ['align', 'offsetX', 'sideOffset', 'state'],
      outputs: ['stateChanged'],
    },
  ],
  host: {
    'data-slot': 'reasoning-effort',
    '[class]': 'classes()',
  },
})
export class ReasoningEffort {
  private readonly popover = inject(BrnPopover);
  private triggerElement: ElementRef<HTMLButtonElement> | undefined;

  /** Selected reasoning-effort value. Supports two-way binding. */
  public readonly value = model<string>('medium');
  /** Ordered values and display wording available to child controls. */
  public readonly levels = input<readonly ReasoningEffortLevel[]>(DEFAULT_REASONING_EFFORT_LEVELS);
  /** Visible and accessible label shared by child controls. */
  public readonly label = input('Reasoning effort');
  /** Text shown when the selected value does not match an available level. */
  public readonly unavailableLabel = input('Unavailable');
  /** Whether all reasoning-effort controls are disabled. */
  public readonly disabled = input(false, { transform: booleanAttribute });
  /** Additional classes merged onto the reasoning-effort root. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  public readonly selectedLevel = computed(() =>
    this.levels().find((level) => level.value === this.value()),
  );
  public readonly selectedLabel = computed(
    () => this.selectedLevel()?.label ?? this.unavailableLabel(),
  );
  public readonly isDisabled = computed(() => this.disabled() || this.levels().length === 0);

  protected readonly classes = computed(() => twMerge(reasoningEffortClasses, this.userClass()));

  /** Selects a value when the root is enabled. */
  public select(value: string): void {
    if (!this.isDisabled()) {
      this.value.set(value);
    }
  }

  /** @internal Registers the trigger used for focus restoration. */
  public registerTrigger(element: ElementRef<HTMLButtonElement>): void {
    this.triggerElement = element;
  }

  /** @internal Closes the popover and returns focus to its trigger. */
  public closeAndFocusTrigger(): void {
    this.popover.close();
    this.triggerElement?.nativeElement.focus();
  }
}
