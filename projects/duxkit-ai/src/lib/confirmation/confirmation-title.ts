import { Component, computed, inject, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';
import { Confirmation } from './confirmation';

@Component({
  selector: '[aiConfirmationTitle],ai-confirmation-title',
  host: {
    '[class]': 'classes()',
  },
  template: '<ng-content>{{ confirmation.title() }}</ng-content>',
})
export class ConfirmationTitle {
  protected readonly confirmation = inject(Confirmation);
  /** Additional classes merged onto the confirmation title element. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });
  protected readonly classes = computed(() => twMerge('inline text-foreground', this.userClass()));
}
