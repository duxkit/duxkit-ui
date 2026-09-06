import { Component, computed, inject, input } from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { Attachment } from './attachment';

export const attachmentPreviewVariants = cva('', {
  variants: {
    variant: {
      grid: 'block min-w-0',
      inline: 'relative inline-flex min-w-0 max-w-full',
      list: 'contents',
    },
  },
  defaultVariants: {
    variant: 'grid',
  },
});

export type AttachmentPreviewVariants = VariantProps<typeof attachmentPreviewVariants>;

import { AttachmentDefaultPreview } from './attachment-default-preview';
@Component({
  selector: '[aiAttachmentPreview],ai-attachment-preview',
  imports: [AttachmentDefaultPreview],
  host: {
    '[class]': 'classes()',
    '[attr.data-kind]': 'attachment.kind()',
    '[attr.data-variant]': 'attachment.variant()',
  },
  template: '<ng-content><ai-attachment-default-preview /></ng-content>',
})
export class AttachmentPreview {
  protected readonly attachment = inject(Attachment);
  /** Additional classes merged onto the preview container. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });
  protected readonly classes = computed(() =>
    twMerge(attachmentPreviewVariants({ variant: this.attachment.variant() }), this.userClass()),
  );
}
