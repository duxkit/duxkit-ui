import { Component, computed, inject, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';
import { Confirmation } from './confirmation';

@Component({
  selector: '[aiConfirmationActions],ai-confirmation-actions',
  host: {
    '[class]': 'classes()',
    '[hidden]': '!visible()',
  },
  template: `
    @if (visible()) {
      <ng-content />
    }
  `,
})
export class ConfirmationActions {
  private readonly confirmation = inject(Confirmation);
  /** Additional classes merged onto the confirmation actions container. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });
  protected readonly visible = computed(() => this.confirmation.state() === 'approval-requested');
  protected readonly classes = computed(() =>
    twMerge('flex items-center justify-end gap-2 self-end', this.userClass()),
  );
}
