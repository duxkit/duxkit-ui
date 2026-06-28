import { computed, Directive, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';
import type { AttachmentsVariant } from './attachment.types';

const attachmentLayoutClasses: Record<AttachmentsVariant, string> = {
  grid: 'grid grid-cols-[repeat(auto-fill,96px)] gap-3',
  inline: 'flex flex-wrap items-center gap-2',
  list: 'flex flex-col gap-2',
};

@Directive({
  selector: '[aiAttachments],ai-attachments',
  host: {
    '[class]': 'classes()',
    '[attr.data-variant]': 'variant()',
    role: 'list',
  },
})
export class Attachments {
  /** Display layout used by projected attachment items. */
  public readonly variant = input<AttachmentsVariant>('grid');
  /** Additional classes merged onto the attachment collection. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() =>
    twMerge('w-full min-w-0', attachmentLayoutClasses[this.variant()], this.userClass()),
  );
}
