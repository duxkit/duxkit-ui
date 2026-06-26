import { Component, computed, inject } from '@angular/core';
import { Confirmation } from './confirmation';
import { confirmationResponseStates } from './confirmation.types';

@Component({
  selector: '[aiConfirmationRejected],ai-confirmation-rejected',
  host: {
    '[hidden]': '!visible()',
  },
  template: `
    @if (visible()) {
      <ng-content />
    }
  `,
})
export class ConfirmationRejected {
  private readonly confirmation = inject(Confirmation);
  protected readonly visible = computed(
    () =>
      this.confirmation.approval()?.approved === false &&
      confirmationResponseStates.includes(this.confirmation.state()),
  );
}
