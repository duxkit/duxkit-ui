import {
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
} from '@angular/core';
import { twMerge } from 'tailwind-merge';

export const checkpointTriggerClasses =
  'inline-flex min-w-0 shrink-0 items-center justify-center rounded-md border-0 bg-transparent px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50';

@Component({
  selector: 'button[aiCheckpointTrigger],ai-checkpoint-trigger',
  host: {
    '[class]': 'classes()',
    '[attr.type]': 'buttonType()',
    '[attr.role]': 'customRole()',
    '[attr.tabindex]': 'customTabIndex()',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.aria-disabled]': 'ariaDisabled()',
    '[attr.disabled]': 'disabledAttribute()',
    '(click)': 'restore($event)',
    '(keydown.enter)': 'restoreFromKeyboard($event)',
    '(keydown.space)': 'restoreFromKeyboard($event)',
  },
  template: '<ng-content />',
})
export class CheckpointTrigger {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Accessible label for the restore trigger when visible text is not enough. */
  public readonly ariaLabel = input<string | undefined>(undefined);
  /** Whether the restore trigger is disabled. */
  public readonly disabled = input(false, { transform: booleanAttribute });
  /** Additional classes merged onto the checkpoint trigger. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });
  /** Emits when the checkpoint restore trigger is pressed. */
  public readonly checkpointRestore = output<void>();

  protected readonly isNativeButton = computed(
    () => this.elementRef.nativeElement.tagName.toLowerCase() === 'button',
  );
  protected readonly buttonType = computed(() => (this.isNativeButton() ? 'button' : null));
  protected readonly customRole = computed(() => (this.isNativeButton() ? null : 'button'));
  protected readonly customTabIndex = computed(() => {
    if (this.isNativeButton()) {
      return null;
    }

    return this.disabled() ? '-1' : '0';
  });
  protected readonly ariaDisabled = computed(() =>
    !this.isNativeButton() && this.disabled() ? 'true' : null,
  );
  protected readonly disabledAttribute = computed(() =>
    this.isNativeButton() && this.disabled() ? '' : null,
  );
  protected readonly classes = computed(() => twMerge(checkpointTriggerClasses, this.userClass()));

  protected restore(event: Event): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    this.checkpointRestore.emit();
  }

  protected restoreFromKeyboard(event: Event): void {
    if (this.isNativeButton()) {
      return;
    }

    this.restore(event);
  }
}
