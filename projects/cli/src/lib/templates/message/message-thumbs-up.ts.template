import { computed, Directive, input, output } from '@angular/core';
import { twMerge } from 'tailwind-merge';
import { feedbackButtonClasses, messageActionButtonClasses } from './message-action-classes';

@Directive({
  selector: 'button[aiMessageThumbsUp]',
  host: {
    '[class]': 'classes()',
    type: 'button',
    '[attr.aria-pressed]': 'active()',
    '(click)': 'thumbsUp.emit()',
  },
})
export class MessageThumbsUp {
  /** Whether the thumbs up action is currently selected. */
  public readonly active = input(false);
  /** Emits when the thumbs up action is pressed. */
  public readonly thumbsUp = output<void>();
  /** Additional classes merged onto the thumbs up button. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() =>
    twMerge(
      messageActionButtonClasses,
      feedbackButtonClasses({ active: this.active() }),
      this.userClass(),
    ),
  );
}
