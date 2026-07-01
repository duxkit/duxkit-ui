import { computed, Directive, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';

@Directive({
  selector: 'img[aiQueueItemImage],img[ai-queue-item-image]',
  host: {
    '[class]': 'classes()',
    '[attr.alt]': 'alt()',
    '[attr.height]': 'height()',
    '[attr.width]': 'width()',
  },
})
export class QueueItemImage {
  /** Alternative text for the queue item image. */
  public readonly alt = input('');
  /** Rendered image height attribute. */
  public readonly height = input<number | string>(32);
  /** Rendered image width attribute. */
  public readonly width = input<number | string>(32);
  /** Additional classes merged onto the queue item image. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() =>
    twMerge('size-8 rounded border border-border object-cover', this.userClass()),
  );
}
