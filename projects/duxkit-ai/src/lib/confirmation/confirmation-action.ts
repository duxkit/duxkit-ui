import { Directive } from '@angular/core';

@Directive({
  selector: 'button[aiConfirmationAction]',
  host: {
    type: 'button',
  },
})
export class ConfirmationAction {}
