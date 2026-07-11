import { Component, computed, inject, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';
import { Attachment } from './attachment';

@Component({
  selector: '[aiAttachmentThumbnail],ai-attachment-thumbnail',
  host: { '[class]': 'classes()' },
  template: '<ng-content />',
})
export class AttachmentThumbnail {
  protected readonly attachment = inject(Attachment);
  /** Additional classes merged onto the attachment thumbnail. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });
  protected readonly classes = computed(() => twMerge('shrink-0', this.userClass()));
}
