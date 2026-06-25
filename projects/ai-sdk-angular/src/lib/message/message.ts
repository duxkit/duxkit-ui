import { computed, Directive, input, signal } from '@angular/core';
import type { UIMessage } from 'ai';
import { twMerge } from 'tailwind-merge';

interface MessageCopyTextEntry {
  readonly id: number;
  readonly text: string;
}

@Directive({
  selector: 'ai-message,[aiMessage]',
  host: {
    '[class.is-user]': 'isUser()',
    '[class.is-assistant]': 'isAssistant()',
    '[class.is-system]': 'isSystem()',
    '[attr.data-ai-message-role]': 'from()',
    '[class]': 'classes()',
  },
})
export class Message {
  public readonly from = input.required<UIMessage['role']>();
  public readonly userClass = input<string | undefined>(undefined, {
    alias: 'class',
  });

  private nextCopyTextEntryId = 0;
  private readonly copyTextEntries = signal<readonly MessageCopyTextEntry[]>([]);

  public readonly isUser = computed(() => this.from() === 'user');
  public readonly isAssistant = computed(() => this.from() === 'assistant');
  public readonly isSystem = computed(() => this.from() === 'system');
  public readonly copyText = computed(() =>
    this.copyTextEntries()
      .map((entry) => entry.text.trim())
      .filter((text) => text.length > 0)
      .join('\n\n'),
  );
  protected readonly classes = computed(() => twMerge('block w-full min-w-0', this.userClass()));

  registerCopyText(): number {
    const id = this.nextCopyTextEntryId++;

    this.copyTextEntries.update((entries) => [...entries, { id, text: '' }]);

    return id;
  }

  updateCopyText(id: number, text: string | undefined): void {
    this.copyTextEntries.update((entries) =>
      entries.map((entry) => (entry.id === id ? { ...entry, text: text ?? '' } : entry)),
    );
  }

  unregisterCopyText(id: number): void {
    this.copyTextEntries.update((entries) => entries.filter((entry) => entry.id !== id));
  }
}
