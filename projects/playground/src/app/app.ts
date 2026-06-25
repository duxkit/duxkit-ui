import { Component, computed, signal } from '@angular/core';
import { Chat } from '@ai-sdk/angular';
import {
  getToolName,
  lastAssistantMessageIsCompleteWithApprovalResponses,
  type UIMessage,
} from 'ai';
import {
  type AiToolPart,
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
  type ChainOfThoughtStepStatus,
  ChainOfThoughtTrigger,
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
  ReasoningContent,
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
    ChainOfThought,
    ChainOfThoughtContent,
    ChainOfThoughtStep,
    ChainOfThoughtTrigger,
    Confirmation,
    ConfirmationAction,
    ConfirmationActions,
    ConfirmationRequest,
    ConfirmationTitle,
    ReasoningContent,
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

  protected hasChainOfThought(message: UIMessage): boolean {
    return message.parts.some((part) => part.type === 'reasoning' || this.isToolPart(part));
  }

  protected chainOfThoughtExpanded(message: UIMessage, lastMessage: boolean): boolean {
    return (
      (lastMessage && this.chat.status === 'streaming') ||
      message.parts.some((part) => this.isToolPart(part) && part.state === 'approval-requested')
    );
  }

  protected reasoningStepStatus(lastMessage: boolean, lastPart: boolean): ChainOfThoughtStepStatus {
    return lastMessage && this.chat.status === 'streaming' && lastPart ? 'active' : 'complete';
  }

  protected reasoningStepIcon(lastMessage: boolean, lastPart: boolean): string {
    return this.reasoningStepStatus(lastMessage, lastPart) === 'active'
      ? 'lucideLoaderCircle'
      : 'lucideCircleCheck';
  }

  protected toolStepStatus(part: AiToolPart): ChainOfThoughtStepStatus {
    switch (part.state) {
      case 'output-available':
      case 'output-error':
        return 'complete';
      case 'approval-requested':
      case 'approval-responded':
      case 'input-available':
      case 'input-streaming':
        return 'active';
      default:
        return 'pending';
    }
  }

  protected toolStepIcon(part: AiToolPart): string {
    return this.toolStepStatus(part) === 'active' ? 'lucideLoaderCircle' : 'lucideCircleCheck';
  }

  protected toolStepLabel(part: AiToolPart): string {
    return `Use ${getToolName(part)}`;
  }

  protected toolStepDescription(part: AiToolPart): string {
    const toolInput = this.describeToolInput(part);

    switch (part.state) {
      case 'approval-requested':
        return toolInput === undefined
          ? 'Waiting for permission before running the tool.'
          : `Waiting for permission to run with ${toolInput}.`;
      case 'approval-responded':
        return part.approval?.approved === false
          ? 'Permission was denied.'
          : 'Permission was approved.';
      case 'input-streaming':
        return 'Generating tool input.';
      case 'input-available':
        return toolInput === undefined ? 'Tool input is ready.' : `Tool input ready: ${toolInput}.`;
      case 'output-available':
        return this.describeToolOutput(part) ?? 'Tool output received.';
      case 'output-error':
        return part.errorText;
      default:
        return part.state.replaceAll('-', ' ');
    }
  }

  private describeToolInput(part: AiToolPart): string | undefined {
    const input = part.input;

    if (input === undefined || input === null || typeof input !== 'object') {
      return undefined;
    }

    if ('city' in input && typeof input.city === 'string') {
      const unit = 'unit' in input && typeof input.unit === 'string' ? ` in ${input.unit}` : '';
      return `${input.city}${unit}`;
    }

    return JSON.stringify(input);
  }

  private describeToolOutput(part: AiToolPart): string | undefined {
    if (part.state !== 'output-available') {
      return undefined;
    }

    const output = part.output;

    if (output === undefined || output === null || typeof output !== 'object') {
      return undefined;
    }

    if (
      'city' in output &&
      typeof output.city === 'string' &&
      'temperature' in output &&
      typeof output.temperature === 'number'
    ) {
      const unit = 'unit' in output && typeof output.unit === 'string' ? output.unit : undefined;
      const condition =
        'condition' in output && typeof output.condition === 'string'
          ? ` and ${output.condition}`
          : '';

      return `Received ${output.temperature}${unit === 'fahrenheit' ? 'F' : 'C'} for ${output.city}${condition}.`;
    }

    return 'Tool output received.';
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
