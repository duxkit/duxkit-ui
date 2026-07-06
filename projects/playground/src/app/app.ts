import { Component, computed, signal } from '@angular/core';
import { Chat } from '@ai-sdk/angular';
import { HlmButton } from '@duxkit/ui/helm/button';
import { HlmIcon } from '@duxkit/ui/helm/icon';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCopy, lucideThumbsDown, lucideThumbsUp } from '@ng-icons/lucide';
import {
  lastAssistantMessageIsCompleteWithApprovalResponses,
  type FileUIPart,
  type UIMessage,
} from 'ai';
import {
  type AiAttachmentPart,
  type AiPromptSubmit,
  type AiToolPart,
  Attachment,
  AttachmentPreview,
  Attachments,
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
  ChainOfThoughtStepDescription,
  ChainOfThoughtStepLabel,
  ChainOfThoughtTrigger,
  Confirmation,
  ConfirmationAction,
  ConfirmationActions,
  ConfirmationAccepted,
  ConfirmationRejected,
  ConfirmationRequest,
  ConfirmationTitle,
  Context,
  ContextCacheUsage,
  ContextContent,
  ContextContentBody,
  ContextContentFooter,
  ContextContentHeader,
  ContextIcon,
  ContextInputUsage,
  ContextOutputUsage,
  ContextReasoningUsage,
  ContextTrigger,
  Conversation,
  ConversationContent,
  ConversationScrollAnchor,
  createModelSelectorSearchValue,
  groupModelSelectorModels,
  Message,
  MessageActions,
  MessageContent,
  MessageCopy,
  MessageThumbsDown,
  MessageThumbsUp,
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorDescription,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorGroupHeading,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorName,
  ModelSelectorShortcut,
  ModelSelectorTitle,
  type ModelSelectorModel,
  ModelSelectorTrigger,
  PromptInput,
  PromptInputAddAttachment,
  PromptInputAttachments,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  Shimmer,
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
  Tool,
  ToolContent,
  ToolTrigger,
} from 'duxkit-ai';

type MessagePart = UIMessage['parts'][number];

interface ChatSource {
  readonly href: string;
  readonly title: string;
}

const availableModels = [
  {
    id: 'qwen3:4b',
    name: 'Qwen 3 4B',
    provider: 'openrouter',
    providerLabel: 'Local Ollama',
    providerSlug: 'openrouter',
    description: 'Default local playground model',
  },
  {
    id: 'qwen3.5:4b',
    name: 'Qwen 3.5 4B',
    provider: 'openrouter',
    providerLabel: 'Local Ollama',
    providerSlug: 'openrouter',
    description: 'Alternate local playground model',
  },
] as const satisfies readonly ModelSelectorModel[];

const modelGroups = groupModelSelectorModels(availableModels);

@Component({
  selector: 'app-root',
  imports: [
    Attachment,
    AttachmentPreview,
    Attachments,
    ChainOfThought,
    ChainOfThoughtContent,
    ChainOfThoughtSearchResult,
    ChainOfThoughtSearchResults,
    ChainOfThoughtStep,
    ChainOfThoughtStepDescription,
    ChainOfThoughtStepLabel,
    ChainOfThoughtTrigger,
    Confirmation,
    ConfirmationAction,
    ConfirmationActions,
    ConfirmationAccepted,
    ConfirmationRejected,
    ConfirmationRequest,
    ConfirmationTitle,
    Context,
    ContextCacheUsage,
    ContextContent,
    ContextContentBody,
    ContextContentFooter,
    ContextContentHeader,
    ContextIcon,
    ContextInputUsage,
    ContextOutputUsage,
    ContextReasoningUsage,
    ContextTrigger,
    Conversation,
    ConversationContent,
    ConversationScrollAnchor,
    HlmIcon,
    HlmButton,
    Message,
    MessageActions,
    MessageContent,
    MessageCopy,
    MessageThumbsDown,
    MessageThumbsUp,
    ModelSelector,
    ModelSelectorContent,
    ModelSelectorDescription,
    ModelSelectorEmpty,
    ModelSelectorGroup,
    ModelSelectorGroupHeading,
    ModelSelectorInput,
    ModelSelectorItem,
    ModelSelectorList,
    ModelSelectorLogo,
    ModelSelectorName,
    ModelSelectorShortcut,
    ModelSelectorTitle,
    ModelSelectorTrigger,
    NgIcon,
    PromptInput,
    PromptInputAddAttachment,
    PromptInputAttachments,
    PromptInputSubmit,
    PromptInputTextarea,
    PromptInputToolbar,
    PromptInputTools,
    Shimmer,
    Source,
    Sources,
    SourcesContent,
    SourcesTrigger,
    Tool,
    ToolContent,
    ToolTrigger,
  ],
  providers: [provideIcons({ lucideCopy, lucideThumbsDown, lucideThumbsUp })],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly messageFeedback = signal<Record<string, 'up' | 'down'>>({});
  protected readonly selectedModel = signal<ModelSelectorModel>(availableModels[0]);
  protected readonly fileError = signal<string | undefined>(undefined);
  protected readonly modelGroups = modelGroups;
  protected readonly modelSearchValue = createModelSelectorSearchValue;

  protected readonly chat = new Chat({
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
  });

  protected readonly estimatedTokenUsage = computed(() => {
    const text = this.chat.messages
      .flatMap((message) => message.parts)
      .filter((part): part is MessagePart & { type: 'text'; text: string } => part.type === 'text')
      .map((part) => part.text)
      .join(' ');
    const tokenEstimate = Math.max(0, Math.ceil(text.length / 4));
    const inputTokens = Math.ceil(tokenEstimate * 0.55);
    const outputTokens = Math.max(0, tokenEstimate - inputTokens);

    return {
      inputTokens,
      outputTokens,
      inputTokenDetails: {
        noCacheTokens: inputTokens,
        cacheReadTokens: Math.ceil(inputTokens * 0.08),
        cacheWriteTokens: 0,
      },
      outputTokenDetails: {
        textTokens: Math.max(0, outputTokens - Math.ceil(outputTokens * 0.15)),
        reasoningTokens: Math.ceil(outputTokens * 0.15),
      },
      totalTokens: tokenEstimate,
    };
  });

  protected readonly estimatedUsedTokens = computed(() =>
    Math.max(1, this.estimatedTokenUsage().totalTokens),
  );

  protected async sendPrompt(event: AiPromptSubmit): Promise<void> {
    const text = event.text.trim();
    const files = event.files.filter((file): file is FileUIPart => file.type === 'file');

    if (this.chat.status !== 'ready' || (text.length === 0 && files.length === 0)) {
      return;
    }

    this.fileError.set(undefined);
    await this.chat.sendMessage({
      text,
      files,
    });
  }

  protected stopResponse(): void {
    this.chat.stop();
  }

  protected recordFileError(event: { message: string }): void {
    this.fileError.set(event.message);
  }

  protected setSelectedModel(model: ModelSelectorModel): void {
    if (!model.disabled) {
      this.selectedModel.set(model);
    }
  }

  protected setMessageFeedback(messageId: string, feedback: 'up' | 'down'): void {
    this.messageFeedback.update((current) => ({ ...current, [messageId]: feedback }));
  }

  protected messageText(message: UIMessage): string {
    return message.parts
      .filter((part): part is MessagePart & { type: 'text'; text: string } => part.type === 'text')
      .map((part) => part.text)
      .join('\n\n');
  }

  protected messageAttachments(message: UIMessage): readonly AiAttachmentPart[] {
    return message.parts.filter(
      (part): part is AiAttachmentPart => part.type === 'file' || part.type === 'source-document',
    );
  }

  protected attachmentKey(attachment: AiAttachmentPart): string {
    if (attachment.type === 'file') {
      return attachment.url;
    }

    return attachment.title || attachment.filename || JSON.stringify(attachment);
  }

  protected messageSources(message: UIMessage): readonly ChatSource[] {
    const sources = new Map<string, ChatSource>();
    const urlPattern = /\bhttps?:\/\/[^\s<>)"']+/gi;

    for (const part of message.parts) {
      if (part.type === 'source-url') {
        sources.set(part.url, { href: part.url, title: part.title ?? part.url });
      }

      if (part.type === 'text') {
        for (const [url] of part.text.matchAll(urlPattern)) {
          sources.set(url, { href: url, title: url.replace(/^https?:\/\//, '') });
        }
      }
    }

    return Array.from(sources.values());
  }

  protected hasChainOfThought(message: UIMessage): boolean {
    return message.parts.some((part) => part.type === 'reasoning');
  }

  protected chainOfThoughtExpanded(lastMessage: boolean): boolean {
    return lastMessage && this.chat.status === 'streaming';
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
}
