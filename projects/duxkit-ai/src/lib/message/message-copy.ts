import { computed, Directive, inject, input, output, signal } from '@angular/core';
import { twMerge } from 'tailwind-merge';
import { Message } from './message';
import { messageActionButtonClasses } from './message-action-classes';

@Directive({
  selector: 'button[aiMessageCopy]',
  host: {
    '[class]': 'classes()',
    type: 'button',
    '[disabled]': '!canCopy()',
    '(click)': 'copy()',
  },
})
export class MessageCopy {
  /** Text copied by the action; falls back to registered message content when omitted. */
  public readonly text = input<string | undefined>();
  /** Emits the copied text after a successful copy action. */
  public readonly copiedChange = output<string>();
  /** Additional classes merged onto the message copy button. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  private readonly message = inject(Message);

  protected readonly copied = signal(false);
  protected readonly copyText = computed(() => this.text() ?? this.message.copyText());
  protected readonly canCopy = computed(() => this.copyText().trim().length > 0);
  protected readonly classes = computed(() =>
    twMerge(messageActionButtonClasses, this.userClass()),
  );

  protected async copy(): Promise<void> {
    const text = this.copyText().trim();

    if (text.length === 0) {
      return;
    }

    await globalThis.navigator?.clipboard?.writeText(text);

    this.copied.set(true);
    this.copiedChange.emit(text);
    globalThis.setTimeout(() => this.copied.set(false), 1400);
  }
}
