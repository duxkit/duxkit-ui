import { Component, computed, signal } from '@angular/core';
import { Chat } from '@ai-sdk/angular';
import type { UIMessage } from 'ai';
import {
  Conversation,
  ConversationContent,
  ConversationScrollAnchor,
  Message,
  MessageActions,
  MessageActionsCopy,
  MessageActionsThumbsDown,
  MessageActionsThumbsUp,
  MessageContent,
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from 'ai-sdk-angular';

@Component({
  selector: 'app-root',
  imports: [
    Conversation,
    ConversationContent,
    ConversationScrollAnchor,
    Message,
    MessageActions,
    MessageActionsCopy,
    MessageActionsThumbsDown,
    MessageActionsThumbsUp,
    MessageContent,
    Reasoning,
    ReasoningContent,
    ReasoningTrigger,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly prompt = signal('');
  protected readonly messageFeedback = signal<Record<string, 'up' | 'down'>>({});
  protected readonly canSubmit = computed(
    () => this.prompt().trim().length > 0 && this.chat.status === 'ready',
  );

  protected readonly chat = new Chat({});

  constructor() {
    void this.loadPersistedMessages();
  }

  protected updatePrompt(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.prompt.set(target.value);
  }

  protected async sendMessage(): Promise<void> {
    const text = this.prompt().trim();

    if (text.length === 0 || this.chat.status !== 'ready') {
      return;
    }

    this.prompt.set('');
    await this.chat.sendMessage({ text });
  }

  protected setMessageFeedback(messageId: string, feedback: 'up' | 'down'): void {
    this.messageFeedback.update((current) => ({ ...current, [messageId]: feedback }));
  }

  private async loadPersistedMessages(): Promise<void> {
    try {
      const response = await fetch('/api/chat');

      if (!response.ok) {
        return;
      }

      const body = (await response.json()) as { messages?: UIMessage[] };

      if (!Array.isArray(body.messages)) {
        return;
      }

      this.chat.messages = body.messages;
    } catch (error) {
      console.error('Failed to load persisted chat.', error);
    }
  }
}
