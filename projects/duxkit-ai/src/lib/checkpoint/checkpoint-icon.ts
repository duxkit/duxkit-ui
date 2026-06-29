import { Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBookmark } from '@ng-icons/lucide';
import { twMerge } from 'tailwind-merge';

export const checkpointIconClasses = 'inline-flex size-4 shrink-0 items-center justify-center';

@Component({
  selector: 'ai-checkpoint-icon,[aiCheckpointIcon]',
  imports: [NgIcon],
  providers: [provideIcons({ lucideBookmark })],
  host: {
    '[class]': 'classes()',
  },
  template: `
    <ng-content>
      <ng-icon name="lucideBookmark" style="--ng-icon__size: 16px" aria-hidden="true" />
    </ng-content>
  `,
})
export class CheckpointIcon {
  /** Additional classes merged onto the checkpoint icon. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() => twMerge(checkpointIconClasses, this.userClass()));
}
