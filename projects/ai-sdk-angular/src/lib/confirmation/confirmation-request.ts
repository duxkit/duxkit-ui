import { Component, computed, inject } from '@angular/core';
import { Confirmation } from './confirmation';

@Component({
  selector: '[aiConfirmationRequest],ai-confirmation-request',
  template: `
    @if (visible()) {
      <ng-content />
    }
  `,
})
export class ConfirmationRequest {
  private readonly confirmation = inject(Confirmation);
  protected readonly visible = computed(() => this.confirmation.state() === 'approval-requested');
}
