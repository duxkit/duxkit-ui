import { computed, Directive, input, output } from '@angular/core';
import { twMerge } from 'tailwind-merge';
import { feedbackButtonClasses, messageActionButtonClasses } from './message-action-classes';

@Directive({
  selector: 'button[aiMessageThumbsDown]',
  host: {
    '[class]': 'classes()',
    type: 'button',
    '[attr.aria-pressed]': 'active()',
    '(click)': 'thumbsDown.emit()',
  },
})
export class MessageThumbsDown {
  /** Whether the thumbs down action is currently selected. */
  public readonly active = input(false);
  /** Emits when the thumbs down action is pressed. */
  public readonly thumbsDown = output<void>();
  /** Additional classes merged onto the thumbs down button. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() =>
    twMerge(
      messageActionButtonClasses,
      feedbackButtonClasses({ active: this.active() }),
      this.userClass(),
    ),
  );
}
