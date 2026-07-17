import { booleanAttribute, Component, computed, input, output } from '@angular/core';
import { twMerge } from 'tailwind-merge';

export const checkpointTriggerClasses =
  'inline-flex min-w-0 shrink-0 items-center justify-center rounded-md border-0 bg-transparent px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50';

@Component({
  selector: 'button[aiCheckpointTrigger]',
  host: {
    '[class]': 'classes()',
    type: 'button',
    '[attr.aria-label]': 'ariaLabel()',
    '[disabled]': 'disabled()',
    '(click)': 'restore($event)',
  },
  template: '<ng-content />',
})
export class CheckpointTrigger {
  /** Accessible label for the restore trigger when visible text is not enough. */
  public readonly ariaLabel = input<string | undefined>(undefined);
  /** Whether the restore trigger is disabled. */
  public readonly disabled = input(false, { transform: booleanAttribute });
  /** Additional classes merged onto the checkpoint trigger. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });
  /** Emits when the checkpoint restore trigger is pressed. */
  public readonly checkpointRestore = output<void>();

  protected readonly classes = computed(() => twMerge(checkpointTriggerClasses, this.userClass()));

  protected restore(event: Event): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    this.checkpointRestore.emit();
  }
}
