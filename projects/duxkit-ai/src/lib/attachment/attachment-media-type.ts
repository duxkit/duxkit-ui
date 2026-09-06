import { Directive, computed, inject, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';
import { Attachment } from './attachment';

@Directive({
  selector: '[aiAttachmentMediaType],ai-attachment-media-type',
  host: { '[class]': 'classes()' },
})
export class AttachmentMediaType {
  protected readonly attachment = inject(Attachment);
  /** Additional classes merged onto the attachment media type. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });
  protected readonly classes = computed(() =>
    twMerge('truncate text-muted-foreground text-xs', this.userClass()),
  );
}
