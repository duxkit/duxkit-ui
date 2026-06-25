import { Component, computed, signal } from '@angular/core';
import { Chat } from '@ai-sdk/angular';
import { lastAssistantMessageIsCompleteWithApprovalResponses, type UIMessage } from 'ai';
import {
  type AiToolPart,
  Confirmation,
  ConfirmationAction,
  ConfirmationActions,
  ConfirmationRequest,
  ConfirmationTitle,
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
  Tool,
  ToolContent,
  ToolTrigger,
} from 'ai-sdk-angular';

type MessagePart = UIMessage['parts'][number];

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
    Confirmation,
    ConfirmationAction,
    ConfirmationActions,
    ConfirmationRequest,
    ConfirmationTitle,
    Reasoning,
    ReasoningContent,
    ReasoningTrigger,
    Tool,
    ToolContent,
    ToolTrigger,
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

  protected readonly chat = new Chat({
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
  });

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

  protected useToolExample(): void {
    this.prompt.set('Use the getWeather tool for London in celsius, then summarize the result.');
  }

  protected isToolPart(part: MessagePart): part is AiToolPart {
    return part.type === 'dynamic-tool' || part.type.startsWith('tool-');
  }

  protected respondToToolApproval(part: AiToolPart, approved: boolean): void {
    const approval = part.approval;

    if (approval === undefined || part.state !== 'approval-requested') {
      return;
    }

    void this.chat.addToolApprovalResponse({
      id: approval.id,
      approved,
      reason: approved ? 'Approved from the playground UI.' : 'Denied from the playground UI.',
    });
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
