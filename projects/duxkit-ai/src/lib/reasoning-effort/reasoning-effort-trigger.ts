import { booleanAttribute, Component, computed, ElementRef, inject, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBrain, lucideChevronDown } from '@ng-icons/lucide';
import { BrnPopoverTrigger } from '@spartan-ng/brain/popover';
import { twMerge } from 'tailwind-merge';
import { injectReasoningEffort } from './reasoning-effort-root';

export const reasoningEffortTriggerClasses =
  'inline-flex h-8 min-w-0 shrink-0 items-center justify-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-sm font-medium text-foreground shadow-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 aria-expanded:bg-muted';

@Component({
  selector: 'button[aiReasoningEffortTrigger],button[ai-reasoning-effort-trigger]',
  imports: [NgIcon],
  providers: [provideIcons({ lucideBrain, lucideChevronDown })],
  hostDirectives: [BrnPopoverTrigger],
  host: {
    'data-slot': 'reasoning-effort-trigger',
    '[attr.aria-label]': 'computedAriaLabel()',
    '[class]': 'classes()',
    '[disabled]': 'isDisabled()',
  },
  template: `
    <ng-content>
      <ng-icon name="lucideBrain" aria-hidden="true" style="--ng-icon__size: 16px" />
      <span class="truncate"
        >{{ reasoningEffort.label() }}: {{ reasoningEffort.selectedLabel() }}</span
      >
      <ng-icon
        name="lucideChevronDown"
        aria-hidden="true"
        class="shrink-0 transition-transform"
        style="--ng-icon__size: 14px"
        [class.rotate-180]="reasoningEffort.isOpen()"
      />
    </ng-content>
  `,
})
export class ReasoningEffortTrigger {
  protected readonly reasoningEffort = injectReasoningEffort();
  private readonly elementRef = inject<ElementRef<HTMLButtonElement>>(ElementRef);

  /** Accessible label for custom projected trigger content. */
  public readonly ariaLabel = input<string | undefined>(undefined);
  /** Whether this trigger alone is disabled. */
  public readonly disabled = input(false, { transform: booleanAttribute });
  /** Additional classes merged onto the trigger button. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly computedAriaLabel = computed(
    () =>
      this.ariaLabel() ??
      `${this.reasoningEffort.label()}: ${this.reasoningEffort.selectedLabel()}`,
  );
  protected readonly isDisabled = computed(
    () => this.disabled() || this.reasoningEffort.isDisabled(),
  );
  protected readonly classes = computed(() =>
    twMerge(reasoningEffortTriggerClasses, this.userClass()),
  );

  public constructor() {
    this.reasoningEffort.registerTrigger(this.elementRef);
  }
}
