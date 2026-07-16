import { booleanAttribute, computed, Directive, ElementRef, inject, input } from '@angular/core';
import { BrnPopoverTrigger } from '@spartan-ng/brain/popover';
import { injectReasoningEffort } from './reasoning-effort-root';

/**
 * Headless trigger behavior for a reasoning-effort popover.
 *
 * Consumers provide the button's content, styling, and accessible name.
 */
@Directive({
  selector: 'button[aiReasoningEffortTrigger],button[ai-reasoning-effort-trigger]',
  hostDirectives: [BrnPopoverTrigger],
  host: {
    'data-slot': 'reasoning-effort-trigger',
    '[disabled]': 'isDisabled()',
  },
})
export class ReasoningEffortTrigger {
  protected readonly reasoningEffort = injectReasoningEffort();
  private readonly elementRef = inject<ElementRef<HTMLButtonElement>>(ElementRef);

  /** Whether this trigger alone is disabled. */
  public readonly disabled = input(false, { transform: booleanAttribute });

  protected readonly isDisabled = computed(
    () => this.disabled() || this.reasoningEffort.isDisabled(),
  );

  public constructor() {
    this.reasoningEffort.registerTrigger(this.elementRef);
  }
}
