import { Directive } from '@angular/core';
import { BrnDialogTitle } from '@spartan-ng/brain/dialog';
import { classes } from '@duxkit-private/ui/helm/utils';

@Directive({
  selector: '[hlmDialogTitle]',
  hostDirectives: [BrnDialogTitle],
  host: { 'data-slot': 'dialog-title' },
})
export class HlmDialogTitle {
  constructor() {
    classes(() => 'leading-none font-medium');
  }
}
