import { Component, computed, inject } from '@angular/core';
import { Confirmation } from './confirmation';
import { confirmationResponseStates } from './confirmation.types';

@Component({
  selector: '[aiConfirmationAccepted],ai-confirmation-accepted',
  host: {
    class: 'grid gap-2',
    '[hidden]': '!visible()',
  },
  template: `
    @if (visible()) {
      <ng-content />
    }
  `,
})
export class ConfirmationAccepted {
  private readonly confirmation = inject(Confirmation);
  protected readonly visible = computed(
    () =>
      this.confirmation.approval()?.approved === true &&
      confirmationResponseStates.includes(this.confirmation.state()),
  );
}
