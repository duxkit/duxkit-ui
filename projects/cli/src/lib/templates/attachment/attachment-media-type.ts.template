import { Component, computed, inject, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';
import { Attachment } from './attachment';

@Component({
  selector: '[aiAttachmentMediaType],ai-attachment-media-type',
  host: { '[class]': 'classes()' },
  template: '<ng-content />',
})
export class AttachmentMediaType {
  protected readonly attachment = inject(Attachment);
  /** Additional classes merged onto the attachment media type. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });
  protected readonly classes = computed(() =>
    twMerge('truncate text-muted-foreground text-xs', this.userClass()),
  );
}
