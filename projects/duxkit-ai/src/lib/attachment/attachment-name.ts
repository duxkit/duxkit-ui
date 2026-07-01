import { Component, computed, inject, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';
import { Attachment } from './attachment';

@Component({
  selector: '[aiAttachmentName],ai-attachment-name',
  host: { '[class]': 'classes()' },
  template: '<ng-content />',
})
export class AttachmentName {
  protected readonly attachment = inject(Attachment);
  /** Additional classes merged onto the attachment name. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });
  protected readonly classes = computed(() => twMerge('min-w-0 truncate', this.userClass()));
}
