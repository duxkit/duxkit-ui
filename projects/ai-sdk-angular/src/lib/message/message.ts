import { computed, Directive, input } from '@angular/core';
import type { UIMessage } from 'ai';

@Directive({
  selector: 'ai-message,[aiMessage]',
  host: {
    '[class.is-user]': 'isUser()',
    '[class.is-assistant]': 'isAssistant()',
    '[class.is-system]': 'isSystem()',
    '[class]': 'userClass()',
  },
})
export class Message {
  public readonly from = input.required<UIMessage['role']>();
  public readonly userClass = input<string | undefined>(undefined, {
    alias: 'class',
  });

  public readonly isUser = computed(() => this.from() === 'user');
  public readonly isAssistant = computed(() => this.from() === 'assistant');
  public readonly isSystem = computed(() => this.from() === 'system');
}
