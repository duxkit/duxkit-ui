import { Component, computed, inject, input, output, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideCopy } from '@ng-icons/lucide';
import { twMerge } from 'tailwind-merge';
import { Message } from './message';
import { messageActionButtonClasses } from './message-action-classes';

@Component({
  selector: 'button[aiMessageCopy]',
  imports: [NgIcon],
  providers: [provideIcons({ lucideCheck, lucideCopy })],
  host: {
    '[class]': 'classes()',
    '[attr.aria-label]': 'copyLabel()',
    '[attr.title]': 'copyLabel()',
    type: 'button',
    '[disabled]': '!canCopy()',
    '(click)': 'copy()',
  },
  template: `
    <ng-content>
      <ng-icon
        [attr.data-icon]="copied() ? 'check' : 'copy'"
        [name]="copied() ? 'lucideCheck' : 'lucideCopy'"
        aria-hidden="true"
        style="--ng-icon__size: 16px"
      />
    </ng-content>
  `,
})
export class MessageCopy {
  /** Text copied by the action; falls back to registered message content when omitted. */
  public readonly text = input<string | undefined>();
  /** Accessible label shown before the message is copied. */
  public readonly label = input('Copy message', { alias: 'aria-label' });
  /** Emits the copied text after a successful copy action. */
  public readonly copiedChange = output<string>();
  /** Additional classes merged onto the message copy button. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  private readonly message = inject(Message);

  protected readonly copied = signal(false);
  protected readonly copyText = computed(() => this.text() ?? this.message.copyText());
  protected readonly canCopy = computed(() => this.copyText().trim().length > 0);
  protected readonly copyLabel = computed(() => (this.copied() ? 'Copied message' : this.label()));
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
