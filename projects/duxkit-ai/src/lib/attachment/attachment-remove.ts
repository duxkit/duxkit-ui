import { Component, computed, ElementRef, inject, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { Attachment } from './attachment';
import { AI_ATTACHMENT_PREVIEW_SLOT } from './attachment-preview-slot';

export const attachmentRemoveVariants = cva(
  'inline-flex shrink-0 items-center justify-center border-0 bg-transparent p-0 text-muted-foreground transition-colors transition-opacity hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  {
    variants: {
      slotVariant: {
        grid: 'absolute top-2 right-2 size-7 rounded-md border border-border bg-background/85 shadow-sm backdrop-blur hover:bg-background focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        inline: '',
        'inline-preview':
          'absolute inset-y-0 left-0 my-auto !size-5 aspect-square overflow-hidden rounded bg-background focus-visible:ring-offset-1 focus-visible:ring-offset-background [&_ng-icon]:!size-3',
        list: 'ml-auto size-8 rounded-md hover:bg-muted focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      },
    },
    defaultVariants: {
      slotVariant: 'grid',
    },
  },
);

export type AttachmentRemoveVariants = VariantProps<typeof attachmentRemoveVariants>;

@Component({
  selector: 'button[aiAttachmentRemove],ai-attachment-remove',
  imports: [NgIcon],
  providers: [provideIcons({ lucideX })],
  host: {
    '[class]': 'classes()',
    '[attr.type]': 'buttonType()',
    '[attr.role]': 'customRole()',
    '[attr.tabindex]': 'customTabIndex()',
    '[attr.data-slot-variant]': 'slotVariant()',
    '[attr.aria-label]': 'label()',
    '[attr.title]': 'label()',
    '(click)': 'remove($event)',
    '(keydown.enter)': 'removeFromKeyboard($event)',
    '(keydown.space)': 'removeFromKeyboard($event)',
  },
  template: `
    <ng-content>
      <ng-icon name="lucideX" style="--ng-icon__size: 16px" aria-hidden="true" />
    </ng-content>
  `,
})
export class AttachmentRemove {
  protected readonly attachment = inject(Attachment);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly isInPreviewSlot =
    inject(AI_ATTACHMENT_PREVIEW_SLOT, { optional: true }) === true;

  /** Accessible label for the remove button. */
  public readonly ariaLabel = input<string | undefined>(undefined);
  /** Additional classes merged onto the attachment remove control. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly isNativeButton = computed(
    () => this.elementRef.nativeElement.tagName.toLowerCase() === 'button',
  );
  protected readonly buttonType = computed(() => (this.isNativeButton() ? 'button' : null));
  protected readonly customRole = computed(() => (this.isNativeButton() ? null : 'button'));
  protected readonly customTabIndex = computed(() => (this.isNativeButton() ? null : '0'));
  protected readonly label = computed(() => this.ariaLabel() ?? this.attachment.removeLabel());
  /** Position the control independently of its nesting. */
  public readonly placement = input<'flow' | 'grid' | 'list' | 'inline-preview'>('flow');
  protected readonly slotVariant = computed(() => {
    const placement = this.placement();
    return placement === 'flow' ? 'inline' : placement;
  });
  protected readonly classes = computed(() =>
    twMerge(attachmentRemoveVariants({ slotVariant: this.slotVariant() }), this.userClass()),
  );

  protected remove(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.attachment.remove();
  }

  protected removeFromKeyboard(event: Event): void {
    if (this.isNativeButton()) {
      return;
    }

    this.remove(event);
  }
}
