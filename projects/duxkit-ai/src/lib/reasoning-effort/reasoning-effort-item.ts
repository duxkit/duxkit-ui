import { booleanAttribute, Component, computed, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck } from '@ng-icons/lucide';
import { twMerge } from 'tailwind-merge';
import { injectReasoningEffort } from './reasoning-effort-root';

export const reasoningEffortItemClasses =
  'flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 aria-pressed:bg-muted';

@Component({
  selector: 'button[aiReasoningEffortItem],button[ai-reasoning-effort-item]',
  imports: [NgIcon],
  providers: [provideIcons({ lucideCheck })],
  host: {
    type: 'button',
    'data-slot': 'reasoning-effort-item',
    '[attr.aria-pressed]': 'isSelected() ? "true" : "false"',
    '[class]': 'classes()',
    '[disabled]': 'isDisabled()',
    '(click)': 'select()',
  },
  template: `
    <ng-content>
      <span class="min-w-0 flex-1">
        <span class="block font-medium">{{ level()?.label ?? value() }}</span>
        @if (level()?.description; as description) {
          <span class="mt-0.5 block text-xs text-muted-foreground">{{ description }}</span>
        }
      </span>
    </ng-content>
    @if (showIndicator()) {
      <ng-icon
        name="lucideCheck"
        aria-hidden="true"
        class="shrink-0"
        style="--ng-icon__size: 16px"
        [class.invisible]="!isSelected()"
      />
    }
  `,
})
export class ReasoningEffortItem {
  private readonly reasoningEffort = injectReasoningEffort();

  /** Reasoning-effort value selected by this item. */
  public readonly value = input.required<string>();
  /** Whether this item alone is disabled. */
  public readonly disabled = input(false, { transform: booleanAttribute });
  /** Whether the default selected-state indicator is rendered. */
  public readonly showIndicator = input(true, { transform: booleanAttribute });
  /** Additional classes merged onto the item button. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });
  /** Emits after this item is selected. */
  public readonly selected = output<string>();

  protected readonly level = computed(() =>
    this.reasoningEffort.levels().find((level) => level.value === this.value()),
  );
  protected readonly isSelected = computed(() => this.reasoningEffort.value() === this.value());
  protected readonly isDisabled = computed(
    () => this.disabled() || this.reasoningEffort.isDisabled(),
  );
  protected readonly classes = computed(() =>
    twMerge(reasoningEffortItemClasses, this.userClass()),
  );

  protected select(): void {
    if (this.isDisabled()) {
      return;
    }

    this.reasoningEffort.select(this.value());
    this.selected.emit(this.value());
    this.reasoningEffort.closeAndFocusTrigger();
  }
}
