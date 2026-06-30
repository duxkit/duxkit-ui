import { booleanAttribute, computed, Directive, ElementRef, inject, input } from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { injectPromptInput } from './prompt-input-root';

export const promptInputButtonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border-0 bg-transparent p-0 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'h-8 px-2',
        icon: 'size-8',
        'icon-sm': 'size-7',
      },
    },
    defaultVariants: {
      size: 'icon-sm',
    },
  },
);

export type PromptInputButtonVariants = VariantProps<typeof promptInputButtonVariants>;

@Directive({
  selector: 'button[aiPromptInputButton],button[ai-prompt-input-button],ai-prompt-input-button',
  host: {
    '[class]': 'classes()',
    '[attr.type]': 'buttonType()',
    '[attr.role]': 'customRole()',
    '[attr.tabindex]': 'customTabIndex()',
    '[attr.aria-disabled]': 'ariaDisabled()',
    '[attr.disabled]': 'disabledAttribute()',
    '(keydown.enter)': 'pressFromKeyboard($event)',
    '(keydown.space)': 'pressFromKeyboard($event)',
  },
})
export class PromptInputButton {
  protected readonly promptInput = injectPromptInput();
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Visual size for the prompt input button. */
  public readonly size = input<PromptInputButtonVariants['size']>('icon-sm');
  /** Whether the prompt input button is disabled. */
  public readonly disabled = input(false, { transform: booleanAttribute });
  /** Additional classes merged onto the prompt input button. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

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
  protected readonly classes = computed(() =>
    twMerge(promptInputButtonVariants({ size: this.size() }), this.userClass()),
  );

  protected pressFromKeyboard(event: Event): void {
    if (this.isNativeButton()) {
      return;
    }

    event.preventDefault();

    if (this.disabled()) {
      return;
    }

    this.elementRef.nativeElement.click();
  }
}
