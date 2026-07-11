import { Component, computed, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';
import type { ConfirmationToolPart } from './confirmation.types';

@Component({
  selector: '[aiConfirmation],ai-confirmation',
  host: {
    '[class]': 'classes()',
    '[hidden]': '!visible()',
    '[attr.data-state]': 'state()',
    '[attr.data-approved]': 'approval()?.approved',
  },
  template: '<ng-content />',
})
export class Confirmation {
  /** AI SDK tool part containing approval state and confirmation metadata. */
  public readonly part = input.required<ConfirmationToolPart>();
  /** Additional classes merged onto the confirmation root element. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  public readonly approval = computed(() => this.part().approval);
  public readonly state = computed(() => this.part().state);
  public readonly visible = computed(() => {
    const state = this.state();

    return (
      this.approval() !== undefined && state !== 'input-streaming' && state !== 'input-available'
    );
  });
  public readonly title = computed(() => {
    const approval = this.approval();

    if (this.state() === 'approval-requested') {
      return 'Approval required';
    }

    if (approval?.approved === true) {
      return 'Approved';
    }

    if (approval?.approved === false) {
      return 'Rejected';
    }

    return 'Confirmation';
  });

  protected readonly classes = computed(() =>
    twMerge(
      'flex flex-col gap-2 rounded-lg border border-border bg-background p-3 text-sm',
      this.userClass(),
    ),
  );
}
