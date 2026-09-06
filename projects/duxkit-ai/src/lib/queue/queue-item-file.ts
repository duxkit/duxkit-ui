import { Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePaperclip } from '@ng-icons/lucide';
import { twMerge } from 'tailwind-merge';

@Component({
  selector: '[aiQueueItemFile],ai-queue-item-file',
  imports: [NgIcon],
  providers: [provideIcons({ lucidePaperclip })],
  host: {
    '[class]': 'classes()',
  },
  template: `
    @if (showIcon()) {
      <ng-icon name="lucidePaperclip" style="--ng-icon__size: 12px" aria-hidden="true" />
    }
    <ng-content />
  `,
})
export class QueueItemFile {
  /** Render the preset file icon. */
  public readonly showIcon = input(true);
  /** Additional classes merged onto the queue item file badge. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() =>
    twMerge(
      'inline-flex min-w-0 items-center gap-1 rounded border border-border bg-muted px-2 py-1 text-xs',
      this.userClass(),
    ),
  );
}
