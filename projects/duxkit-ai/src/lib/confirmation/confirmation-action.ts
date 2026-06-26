import { Directive, inject } from '@angular/core';
import { HlmButton } from 'duxkit-ai/helm/button';

@Directive({
  selector: 'button[aiConfirmationAction]',
  hostDirectives: [{ directive: HlmButton, inputs: ['variant', 'size'] }],
  host: {
    type: 'button',
  },
})
export class ConfirmationAction {
  private readonly button = inject(HlmButton);

  constructor() {
    this.button.setClass('h-8 px-3 text-sm');
  }
}
