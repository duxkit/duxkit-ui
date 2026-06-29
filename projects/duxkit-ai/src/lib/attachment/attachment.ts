import { computed, Directive, ElementRef, inject, input, output, signal } from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { Attachments } from './attachments';
import {
  getAttachmentKind,
  getAttachmentMediaType,
  getAttachmentName,
  getAttachmentUrl,
  type AiAttachmentPart,
} from './attachment.types';

export const attachmentVariants = cva(
  'group relative min-w-0 border border-border bg-background text-foreground transition-colors',
  {
    variants: {
      variant: {
        grid: 'flex size-24 flex-col overflow-hidden rounded-xl hover:bg-muted/40',
        inline:
          'inline-flex h-8 max-w-full cursor-pointer select-none items-center gap-1.5 rounded-md px-1.5 font-medium text-sm hover:bg-muted/60 dark:hover:bg-muted/40',
        list: 'flex items-center gap-3 rounded-lg p-3 hover:bg-muted/40',
      },
    },
    defaultVariants: {
      variant: 'grid',
    },
  },
);

export type AttachmentVariants = VariantProps<typeof attachmentVariants>;

@Directive({
  selector: '[aiAttachment],ai-attachment',
  host: {
    '[class]': 'classes()',
    '[attr.data-kind]': 'kind()',
    '[attr.data-media-type]': 'mediaType()',
    '[attr.aria-label]': 'descriptionLabel()',
    '(mouseenter)': 'hovered.set(true)',
    '(mouseleave)': 'hovered.set(false)',
    '(focusin)': 'hovered.set(true)',
    '(focusout)': 'onFocusOut($event)',
    role: 'listitem',
  },
})
export class Attachment {
  /** AI SDK file or source-document part rendered by this attachment. */
  public readonly data = input.required<AiAttachmentPart>();
  /** Emits the current attachment part when the remove control is pressed. */
  public readonly removed = output<AiAttachmentPart>();
  /** Additional classes merged onto the attachment root element. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  private readonly attachments = inject(Attachments, { optional: true });
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  public readonly variant = computed(() => this.attachments?.variant() ?? 'grid');
  public readonly name = computed(() => getAttachmentName(this.data()));
  public readonly mediaType = computed(() => getAttachmentMediaType(this.data()));
  public readonly kind = computed(() => getAttachmentKind(this.data()));
  public readonly url = computed(() => getAttachmentUrl(this.data()));
  public readonly previewLabel = computed(() => `Preview ${this.name()}`);
  public readonly removeLabel = computed(() => `Remove ${this.name()}`);
  public readonly descriptionLabel = computed(() => `${this.name()}, ${this.mediaType()}`);
  public readonly hovered = signal(false);

  protected readonly classes = computed(() =>
    twMerge(attachmentVariants({ variant: this.variant() }), this.userClass()),
  );

  remove(): void {
    this.removed.emit(this.data());
  }

  protected onFocusOut(event: FocusEvent): void {
    const nextFocusedElement = event.relatedTarget as Node | null;

    if (
      nextFocusedElement !== null &&
      this.elementRef.nativeElement.contains(nextFocusedElement)
    ) {
      return;
    }

    this.hovered.set(false);
  }
}
