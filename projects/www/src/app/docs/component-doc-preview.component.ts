import { Component, input } from '@angular/core';
import { HlmButton } from '@duxkit/ui/helm/button';
import type { LanguageModelUsage } from 'ai';
import {
  type AiPromptSubmit,
  Attachment,
  type AiAttachmentPart,
  type AiToolPart,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
  type AttachmentsVariant,
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtImage,
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
  ChainOfThoughtTrigger,
  Checkpoint,
  CheckpointIcon,
  CheckpointTrigger,
  CodeBlock,
  Confirmation,
  ConfirmationAction,
  ConfirmationActions,
  ConfirmationAccepted,
  ConfirmationRejected,
  ConfirmationRequest,
  ConfirmationTitle,
  Conversation,
  ConversationContent,
  ConversationScrollAnchor,
  Context,
  ContextCacheUsage,
  ContextContent,
  ContextContentBody,
  ContextContentFooter,
  ContextContentHeader,
  ContextInputUsage,
  ContextOutputUsage,
  ContextReasoningUsage,
  ContextTrigger,
  Message,
  MessageActions,
  MessageActionsCopy,
  MessageContent,
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorName,
  ModelSelectorShortcut,
  ModelSelectorTrigger,
  PromptInput,
  PromptInputAddAttachment,
  PromptInputAttachments,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
  Shimmer,
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
  Task,
  TaskContent,
  TaskItem,
  TaskItemFile,
  TaskTrigger,
  Tool,
  ToolContent,
  ToolTrigger,
  createModelSelectorSearchValue,
  groupModelSelectorModels,
  type ModelSelectorModel,
} from 'duxkit-ai';
import { type ComponentDocSlug } from './component-docs.registry';

export const componentPreviewSnippets: Record<ComponentDocSlug, string> = {
  conversation: `<ai-conversation class="h-[420px] w-[640px] rounded-lg border border-border bg-background">
  <ai-conversation-content class="space-y-3 p-4">
    <ai-message from="user">
      <ai-message-content>Show me the latest weather for London.</ai-message-content>
    </ai-message>
    <ai-message from="assistant">
      <ai-message-content [markdown]="assistantMessage" />
    </ai-message>
    <ai-message from="user">
      <ai-message-content>Can you include the tool output?</ai-message-content>
    </ai-message>
    <ai-message from="assistant">
      <ai-message-content [markdown]="toolMessage" />
    </ai-message>
    <div aiConversationScrollAnchor></div>
  </ai-conversation-content>
</ai-conversation>`,
  message: `<div class="w-[560px]">
  <ai-message from="assistant">
    <ai-message-content [markdown]="messageMarkdown" />
    <ai-message-actions>
      <ai-message-actions-copy />
    </ai-message-actions>
  </ai-message>
</div>`,
  checkpoint: `<ai-checkpoint class="w-[720px]">
  <ai-checkpoint-icon />
  <button
    aiCheckpointTrigger
    hlmBtn
    variant="ghost"
    size="sm"
    ariaLabel="Restore to this checkpoint"
  >
    Restore checkpoint
  </button>
</ai-checkpoint>`,
  context: `<ai-context
  [usedTokens]="40000"
  [maxTokens]="128000"
  [usage]="contextUsage"
  modelId="openai:gpt-4o-mini"
>
  <button aiContextTrigger hlmBtn variant="ghost" size="sm"></button>
  <ai-context-content>
    <ai-context-content-header />
    <ai-context-content-body>
      <ai-context-input-usage />
      <ai-context-output-usage />
      <ai-context-reasoning-usage />
      <ai-context-cache-usage />
    </ai-context-content-body>
    <ai-context-content-footer />
  </ai-context-content>
</ai-context>`,
  'model-selector': `<ai-model-selector class="w-[min(92vw,520px)]">
  <button aiModelSelectorTrigger hlmBtn class="justify-between" variant="outline">
    <ai-model-selector-logo provider="openai" />
    <ai-model-selector-name>GPT-4.1</ai-model-selector-name>
  </button>
  <ai-model-selector-content>
    <ai-model-selector-input placeholder="Search models..." />
    <ai-model-selector-list>
      <ai-model-selector-empty>No models found.</ai-model-selector-empty>
      @for (group of modelSelectorGroups; track group.provider) {
        <ai-model-selector-group [heading]="group.heading">
          @for (model of group.models; track model.id) {
            <button aiModelSelectorItem [value]="modelSelectorSearchValue(model)">
              <ai-model-selector-logo [provider]="model.providerSlug ?? model.provider" />
              <ai-model-selector-name>{{ model.name }}</ai-model-selector-name>
              @if (model.shortcut; as shortcut) {
                <ai-model-selector-shortcut>{{ shortcut }}</ai-model-selector-shortcut>
              }
            </button>
          }
        </ai-model-selector-group>
      }
    </ai-model-selector-list>
  </ai-model-selector-content>
</ai-model-selector>`,
  'prompt-input': `<form aiPromptInput class="w-[640px]" (promptSubmit)="recordPromptSubmit($event)">
  <textarea aiPromptInputTextarea placeholder="Ask a question..."></textarea>
  <ai-prompt-input-attachments />
  <ai-prompt-input-toolbar>
    <ai-prompt-input-tools>
      <ai-model-selector>
        <button aiModelSelectorTrigger hlmBtn class="justify-between" variant="outline" size="sm">
          <ai-model-selector-logo provider="openai" />
          <ai-model-selector-name>GPT-4.1</ai-model-selector-name>
        </button>
        <ai-model-selector-content>
          <ai-model-selector-input placeholder="Search models..." />
          <ai-model-selector-list>
            <ai-model-selector-empty>No models found.</ai-model-selector-empty>
            @for (group of modelSelectorGroups; track group.provider) {
              <ai-model-selector-group [heading]="group.heading">
                @for (model of group.models; track model.id) {
                  <button aiModelSelectorItem [value]="modelSelectorSearchValue(model)">
                    <ai-model-selector-logo [provider]="model.providerSlug ?? model.provider" />
                    <ai-model-selector-name>{{ model.name }}</ai-model-selector-name>
                  </button>
                }
              </ai-model-selector-group>
            }
          </ai-model-selector-list>
        </ai-model-selector-content>
      </ai-model-selector>
      <button aiPromptInputAddAttachment hlmBtn variant="ghost" size="icon-sm"></button>
    </ai-prompt-input-tools>
    <button aiPromptInputSubmit hlmBtn size="icon-sm"></button>
  </ai-prompt-input-toolbar>
</form>`,
  attachment: `<ai-attachments class="w-[640px]" variant="grid">
  @for (attachment of attachmentParts; track attachmentKey(attachment)) {
    <ai-attachment [data]="attachment">
      <ai-attachment-preview />
      <button aiAttachmentRemove hlmBtn variant="ghost" size="icon-sm"></button>
    </ai-attachment>
  }
</ai-attachments>`,
  'chain-of-thought': `<ai-chain-of-thought class="w-[560px]" [expanded]="true" [autoToggle]="false" [isStreaming]="false">
  <button aiChainOfThoughtTrigger></button>
  <ai-chain-of-thought-content>
    <ai-chain-of-thought-step
      status="complete"
      icon="lucideCircleCheck"
      label="Parsed the request"
      description="Identified the Angular components needed for the response."
    />

    <ai-chain-of-thought-step
      status="active"
      icon="lucideLoaderCircle"
      label="Checked relevant sources"
      description="Collected the component API shape and matching usage patterns."
    >
      <ai-chain-of-thought-search-results>
        <span aiChainOfThoughtSearchResult>AI Elements</span>
        <span aiChainOfThoughtSearchResult>Angular signals</span>
        <span aiChainOfThoughtSearchResult>Spartan collapsible</span>
      </ai-chain-of-thought-search-results>
    </ai-chain-of-thought-step>

    <ai-chain-of-thought-step
      status="active"
      icon="lucideCircleDashed"
      label="Request permission"
      description="Ask before running the tool that changes user data."
    >
      <ai-confirmation [part]="chainApprovalPart">
        <ai-confirmation-request>
          <ai-confirmation-title />
          <p class="my-2 text-muted-foreground">Allow this tool to add the selected place to notes?</p>
          <ai-confirmation-actions>
            <button aiConfirmationAction hlmBtn variant="outline">Deny</button>
            <button aiConfirmationAction hlmBtn>Allow</button>
          </ai-confirmation-actions>
        </ai-confirmation-request>
      </ai-confirmation>
    </ai-chain-of-thought-step>

    <ai-chain-of-thought-step
      status="pending"
      icon="lucideCircleDashed"
      label="Generate final answer"
      description="Prepare a concise implementation summary for the user."
    />

    <ai-chain-of-thought-image caption="Optional media preview attached to a thought step.">
      <div class="flex h-32 w-full items-center justify-center rounded-md border border-border bg-background text-muted-foreground text-sm">Preview</div>
    </ai-chain-of-thought-image>
  </ai-chain-of-thought-content>
</ai-chain-of-thought>`,
  task: `<ai-task class="w-[560px]" [expanded]="true">
  <button aiTaskTrigger>Searched the workspace</button>
  <ai-task-content>
    <ai-task-item>
      Matched reasoning usage in <ai-task-item-file>reasoning-content.ts</ai-task-item-file>
    </ai-task-item>
    <ai-task-item>
      Checked chain UI patterns in <ai-task-item-file>chain-of-thought-step.ts</ai-task-item-file>
    </ai-task-item>
    <ai-task-item>
      Prepared the implementation plan for <ai-task-item-file>task/</ai-task-item-file>
    </ai-task-item>
  </ai-task-content>
</ai-task>`,
  tool: `<ai-tool class="w-[560px]" [part]="weatherToolPart" [expanded]="true">
  <button aiToolTrigger></button>
  <ai-tool-content />
  <ai-confirmation [part]="weatherToolPart">
    <ai-confirmation-request>
      <ai-confirmation-title />
      <p class="m-0 leading-relaxed">Allow this tool to run with the generated input?</p>
      <ai-confirmation-actions>
        <button aiConfirmationAction hlmBtn variant="outline">Deny</button>
        <button aiConfirmationAction hlmBtn>Allow</button>
      </ai-confirmation-actions>
    </ai-confirmation-request>
  </ai-confirmation>
</ai-tool>`,
  reasoning: `<ai-reasoning class="w-[560px]" [isStreaming]="false" [expanded]="true">
  <button aiReasoningTrigger></button>
  <ai-reasoning-content [markdown]="reasoningMarkdown" />
</ai-reasoning>`,
  sources: `<ai-sources [expanded]="true">
  <button aiSourcesTrigger [count]="sources.length"></button>
  <ai-sources-content>
    @for (source of sources; track source.href) {
      <a aiSource [href]="source.href" [title]="source.title"></a>
    }
  </ai-sources-content>
</ai-sources>`,
  confirmation: `<ai-confirmation class="w-[420px]" [part]="confirmationRequestedPart">
  <ai-confirmation-request>
    <ai-confirmation-title />
    <p class="my-2 text-muted-foreground">Allow this tool to run with the generated input?</p>
    <ai-confirmation-actions>
      <button aiConfirmationAction hlmBtn variant="outline">Deny</button>
      <button aiConfirmationAction hlmBtn>Allow</button>
    </ai-confirmation-actions>
  </ai-confirmation-request>
  <ai-confirmation-accepted>
    <ai-confirmation-title />
  </ai-confirmation-accepted>
  <ai-confirmation-rejected>
    <ai-confirmation-title />
  </ai-confirmation-rejected>
</ai-confirmation>`,
  'code-block': `<ai-code-block language="ts" [code]="codeBlockCode" />`,
  shimmer: `<p aiShimmer class="text-lg font-medium">
  Generating a response from the model...
</p>`,
};

export const attachmentPreviewSnippets: Record<AttachmentsVariant, string> = {
  grid: componentPreviewSnippets.attachment,
  inline: `<ai-attachments class="w-[640px]" variant="inline">
  @for (attachment of attachmentParts; track attachmentKey(attachment)) {
    <ai-attachment [data]="attachment">
      <ai-attachment-preview>
        <button aiAttachmentRemove hlmBtn variant="ghost" size="icon-xs"></button>
      </ai-attachment-preview>
    </ai-attachment>
  }
</ai-attachments>`,
  list: `<ai-attachments class="w-[640px]" variant="list">
  @for (attachment of attachmentParts; track attachmentKey(attachment)) {
    <ai-attachment [data]="attachment">
      <ai-attachment-preview />
      <button aiAttachmentRemove hlmBtn variant="ghost" size="icon-sm"></button>
    </ai-attachment>
  }
</ai-attachments>`,
};

@Component({
  selector: 'app-component-doc-preview',
  imports: [
    Attachment,
    AttachmentPreview,
    AttachmentRemove,
    Attachments,
    ChainOfThought,
    ChainOfThoughtContent,
    ChainOfThoughtImage,
    ChainOfThoughtSearchResult,
    ChainOfThoughtSearchResults,
    ChainOfThoughtStep,
    ChainOfThoughtTrigger,
    Checkpoint,
    CheckpointIcon,
    CheckpointTrigger,
    CodeBlock,
    Confirmation,
    ConfirmationAction,
    ConfirmationActions,
    ConfirmationAccepted,
    ConfirmationRejected,
    ConfirmationRequest,
    ConfirmationTitle,
    Conversation,
    ConversationContent,
    ConversationScrollAnchor,
    Context,
    ContextCacheUsage,
    ContextContent,
    ContextContentBody,
    ContextContentFooter,
    ContextContentHeader,
    ContextInputUsage,
    ContextOutputUsage,
    ContextReasoningUsage,
    ContextTrigger,
    HlmButton,
    Message,
    MessageActions,
    MessageActionsCopy,
    MessageContent,
    ModelSelector,
    ModelSelectorContent,
    ModelSelectorEmpty,
    ModelSelectorGroup,
    ModelSelectorInput,
    ModelSelectorItem,
    ModelSelectorList,
    ModelSelectorLogo,
    ModelSelectorName,
    ModelSelectorShortcut,
    ModelSelectorTrigger,
    PromptInput,
    PromptInputAddAttachment,
    PromptInputAttachments,
    PromptInputSubmit,
    PromptInputTextarea,
    PromptInputToolbar,
    PromptInputTools,
    Reasoning,
    ReasoningContent,
    ReasoningTrigger,
    Shimmer,
    Source,
    Sources,
    SourcesContent,
    SourcesTrigger,
    Task,
    TaskContent,
    TaskItem,
    TaskItemFile,
    TaskTrigger,
    Tool,
    ToolContent,
    ToolTrigger,
  ],
  template: `
    @switch (slug()) {
      @case ('conversation') {
        <ai-conversation class="h-[420px] w-[640px] rounded-lg border border-border bg-background">
          <ai-conversation-content class="space-y-3 p-4">
            <ai-message from="user">
              <ai-message-content>Show me the latest weather for London.</ai-message-content>
            </ai-message>
            <ai-message from="assistant">
              <ai-message-content [markdown]="assistantMessage" />
            </ai-message>
            <ai-message from="user">
              <ai-message-content>Can you include the tool output?</ai-message-content>
            </ai-message>
            <ai-message from="assistant">
              <ai-message-content [markdown]="toolMessage" />
            </ai-message>
            <div aiConversationScrollAnchor></div>
          </ai-conversation-content>
        </ai-conversation>
      }

      @case ('message') {
        <div class="w-[560px]">
          <ai-message from="assistant">
            <ai-message-content [markdown]="messageMarkdown" />
            <ai-message-actions>
              <ai-message-actions-copy />
            </ai-message-actions>
          </ai-message>
        </div>
      }

      @case ('checkpoint') {
        <ai-checkpoint class="w-[720px]">
          <ai-checkpoint-icon />
          <button
            aiCheckpointTrigger
            hlmBtn
            variant="ghost"
            size="sm"
            ariaLabel="Restore to this checkpoint"
          >
            Restore checkpoint
          </button>
        </ai-checkpoint>
      }

      @case ('context') {
        <ai-context
          [usedTokens]="40000"
          [maxTokens]="128000"
          [usage]="contextUsage"
          modelId="openai:gpt-4o-mini"
        >
          <button aiContextTrigger hlmBtn variant="ghost" size="sm"></button>
          <ai-context-content>
            <ai-context-content-header />
            <ai-context-content-body>
              <ai-context-input-usage />
              <ai-context-output-usage />
              <ai-context-reasoning-usage />
              <ai-context-cache-usage />
            </ai-context-content-body>
            <ai-context-content-footer />
          </ai-context-content>
        </ai-context>
      }

      @case ('model-selector') {
        <ai-model-selector class="w-[min(92vw,520px)]">
          <button aiModelSelectorTrigger hlmBtn class="justify-between" variant="outline">
            <ai-model-selector-logo provider="openai" />
            <ai-model-selector-name>GPT-4.1</ai-model-selector-name>
          </button>
          <ai-model-selector-content>
            <ai-model-selector-input placeholder="Search models..." />
            <ai-model-selector-list>
              <ai-model-selector-empty>No models found.</ai-model-selector-empty>
              @for (group of modelSelectorGroups; track group.provider) {
                <ai-model-selector-group [heading]="group.heading">
                  @for (model of group.models; track model.id) {
                    <button aiModelSelectorItem [value]="modelSelectorSearchValue(model)">
                      <ai-model-selector-logo [provider]="model.providerSlug ?? model.provider" />
                      <ai-model-selector-name>{{ model.name }}</ai-model-selector-name>
                      @if (model.shortcut; as shortcut) {
                        <ai-model-selector-shortcut>{{ shortcut }}</ai-model-selector-shortcut>
                      }
                    </button>
                  }
                </ai-model-selector-group>
              }
            </ai-model-selector-list>
          </ai-model-selector-content>
        </ai-model-selector>
      }

      @case ('attachment') {
        <ai-attachments class="w-[640px]" [variant]="attachmentVariant()">
          @for (attachment of attachmentParts; track attachmentKey(attachment)) {
            <ai-attachment [data]="attachment">
              @if (attachmentVariant() === 'inline') {
                <ai-attachment-preview>
                  <button aiAttachmentRemove hlmBtn variant="ghost" size="icon-xs"></button>
                </ai-attachment-preview>
              } @else {
                <ai-attachment-preview />
                <button aiAttachmentRemove hlmBtn variant="ghost" size="icon-sm"></button>
              }
            </ai-attachment>
          }
        </ai-attachments>
      }

      @case ('prompt-input') {
        <form aiPromptInput class="w-[640px]" (promptSubmit)="recordPromptSubmit($event)">
          <textarea aiPromptInputTextarea placeholder="Ask a question..."></textarea>
          <ai-prompt-input-attachments />
          <ai-prompt-input-toolbar>
            <ai-prompt-input-tools>
              <ai-model-selector>
                <button
                  aiModelSelectorTrigger
                  hlmBtn
                  class="justify-between"
                  variant="outline"
                  size="sm"
                >
                  <ai-model-selector-logo provider="openai" />
                  <ai-model-selector-name>GPT-4.1</ai-model-selector-name>
                </button>
                <ai-model-selector-content>
                  <ai-model-selector-input placeholder="Search models..." />
                  <ai-model-selector-list>
                    <ai-model-selector-empty>No models found.</ai-model-selector-empty>
                    @for (group of modelSelectorGroups; track group.provider) {
                      <ai-model-selector-group [heading]="group.heading">
                        @for (model of group.models; track model.id) {
                          <button aiModelSelectorItem [value]="modelSelectorSearchValue(model)">
                            <ai-model-selector-logo
                              [provider]="model.providerSlug ?? model.provider"
                            />
                            <ai-model-selector-name>{{ model.name }}</ai-model-selector-name>
                          </button>
                        }
                      </ai-model-selector-group>
                    }
                  </ai-model-selector-list>
                </ai-model-selector-content>
              </ai-model-selector>
              <button aiPromptInputAddAttachment hlmBtn variant="ghost" size="icon-sm"></button>
            </ai-prompt-input-tools>
            <button aiPromptInputSubmit hlmBtn size="icon-sm"></button>
          </ai-prompt-input-toolbar>
        </form>
      }

      @case ('chain-of-thought') {
        <ai-chain-of-thought
          class="w-[560px]"
          [expanded]="true"
          [autoToggle]="false"
          [isStreaming]="false"
        >
          <button aiChainOfThoughtTrigger></button>
          <ai-chain-of-thought-content>
            <ai-chain-of-thought-step
              status="complete"
              icon="lucideCircleCheck"
              label="Parsed the request"
              description="Identified the Angular components needed for the response."
            />
            <ai-chain-of-thought-step
              status="active"
              icon="lucideLoaderCircle"
              label="Checked relevant sources"
              description="Collected the component API shape and matching usage patterns."
            >
              <ai-chain-of-thought-search-results>
                <span aiChainOfThoughtSearchResult>AI Elements</span>
                <span aiChainOfThoughtSearchResult>Angular signals</span>
                <span aiChainOfThoughtSearchResult>Spartan collapsible</span>
              </ai-chain-of-thought-search-results>
            </ai-chain-of-thought-step>

            <ai-chain-of-thought-step
              status="active"
              icon="lucideCircleDashed"
              label="Request permission"
              description="Ask before running the tool that changes user data."
            >
              <ai-confirmation [part]="chainApprovalPart">
                <ai-confirmation-request>
                  <ai-confirmation-title />
                  <p class="my-2 text-muted-foreground">
                    Allow this tool to add the selected place to notes?
                  </p>
                  <ai-confirmation-actions>
                    <button aiConfirmationAction hlmBtn variant="outline">Deny</button>
                    <button aiConfirmationAction hlmBtn>Allow</button>
                  </ai-confirmation-actions>
                </ai-confirmation-request>
              </ai-confirmation>
            </ai-chain-of-thought-step>

            <ai-chain-of-thought-step
              status="pending"
              icon="lucideCircleDashed"
              label="Generate final answer"
              description="Prepare a concise implementation summary for the user."
            />

            <ai-chain-of-thought-image caption="Optional media preview attached to a thought step.">
              <div
                class="flex h-32 w-full items-center justify-center rounded-md border border-border bg-background text-muted-foreground text-sm"
              >
                Preview
              </div>
            </ai-chain-of-thought-image>
          </ai-chain-of-thought-content>
        </ai-chain-of-thought>
      }

      @case ('task') {
        <ai-task class="w-[560px]" [expanded]="true">
          <button aiTaskTrigger>Searched the workspace</button>
          <ai-task-content>
            <ai-task-item>
              Matched reasoning usage in
              <ai-task-item-file>reasoning-content.ts</ai-task-item-file>
            </ai-task-item>
            <ai-task-item>
              Checked chain UI patterns in
              <ai-task-item-file>chain-of-thought-step.ts</ai-task-item-file>
            </ai-task-item>
            <ai-task-item>
              Prepared the implementation plan for <ai-task-item-file>task/</ai-task-item-file>
            </ai-task-item>
          </ai-task-content>
        </ai-task>
      }

      @case ('tool') {
        <ai-tool class="w-[560px]" [part]="weatherToolPart" [expanded]="true">
          <button aiToolTrigger></button>
          <ai-tool-content />
          <ai-confirmation [part]="weatherToolPart">
            <ai-confirmation-request>
              <ai-confirmation-title />
              <p class="m-0 leading-relaxed">Allow this tool to run with the generated input?</p>
              <ai-confirmation-actions>
                <button aiConfirmationAction hlmBtn variant="outline">Deny</button>
                <button aiConfirmationAction hlmBtn>Allow</button>
              </ai-confirmation-actions>
            </ai-confirmation-request>
          </ai-confirmation>
        </ai-tool>
      }

      @case ('reasoning') {
        <ai-reasoning class="w-[560px]" [isStreaming]="false" [expanded]="true">
          <button aiReasoningTrigger></button>
          <ai-reasoning-content [markdown]="reasoningMarkdown" />
        </ai-reasoning>
      }

      @case ('sources') {
        <ai-sources [expanded]="true">
          <button aiSourcesTrigger [count]="sources.length"></button>
          <ai-sources-content>
            @for (source of sources; track source.href) {
              <a aiSource [href]="source.href" [title]="source.title"></a>
            }
          </ai-sources-content>
        </ai-sources>
      }

      @case ('confirmation') {
        <ai-confirmation class="w-[420px]" [part]="confirmationRequestedPart">
          <ai-confirmation-request>
            <ai-confirmation-title />
            <p class="my-2 text-muted-foreground">
              Allow this tool to run with the generated input?
            </p>
            <ai-confirmation-actions>
              <button aiConfirmationAction hlmBtn variant="outline">Deny</button>
              <button aiConfirmationAction hlmBtn>Allow</button>
            </ai-confirmation-actions>
          </ai-confirmation-request>
          <ai-confirmation-accepted>
            <ai-confirmation-title />
          </ai-confirmation-accepted>
          <ai-confirmation-rejected>
            <ai-confirmation-title />
          </ai-confirmation-rejected>
        </ai-confirmation>
      }

      @case ('code-block') {
        <ai-code-block language="ts" [code]="codeBlockCode" />
      }

      @case ('shimmer') {
        <p aiShimmer class="text-lg font-medium">Generating a response from the model...</p>
      }
    }
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class ComponentDocPreview {
  public readonly slug = input.required<ComponentDocSlug>();
  public readonly attachmentVariant = input<AttachmentsVariant>('grid');

  protected readonly assistantMessage =
    'London is partly cloudy today. I can call the weather tool if you want a deterministic test result.';
  protected readonly toolMessage =
    'The test tool returned `24°C`, partly cloudy, from `playground-test-tool`.';
  protected readonly messageMarkdown =
    'Here is a response with **markdown** and a small code example.\n\n```ts\nconst message = "Hello from AI SDK Angular";\n```';
  protected readonly reasoningMarkdown = [
    '1. **Inspect the user request:** The user wants a UI component that shows model reasoning.',
    '2. **Choose the rendering pattern:** Use a collapsible region so the main answer stays readable.',
    '3. **Preserve streaming state:** Keep the trigger open while reasoning is streaming.',
  ].join('\n');
  protected readonly codeBlockCode = `import { Component, signal } from '@angular/core';

@Component({
  selector: 'example-counter',
  template: '<button (click)="count.update(value => value + 1)">{{ count() }}</button>',
})
export class ExampleCounter {
  protected readonly count = signal(0);
}`;
  protected readonly contextUsage: LanguageModelUsage = {
    inputTokens: 32_000,
    inputTokenDetails: {
      cacheReadTokens: 4_000,
      cacheWriteTokens: 0,
      noCacheTokens: 28_000,
    },
    outputTokens: 8_000,
    outputTokenDetails: {
      reasoningTokens: 1_500,
      textTokens: 6_500,
    },
    totalTokens: 41_500,
  };
  protected readonly modelSelectorModels = [
    {
      id: 'gpt-4.1',
      name: 'GPT-4.1',
      provider: 'openai',
      providerLabel: 'OpenAI',
      shortcut: 'M1',
    },
    {
      id: 'gpt-4.1-mini',
      name: 'GPT-4.1 Mini',
      provider: 'openai',
      providerLabel: 'OpenAI',
    },
    {
      id: 'claude-sonnet-4.5',
      name: 'Claude Sonnet 4.5',
      provider: 'anthropic',
      providerLabel: 'Anthropic',
      shortcut: 'M2',
    },
    {
      id: 'gemini-2.5-pro',
      name: 'Gemini 2.5 Pro',
      provider: 'google',
      providerLabel: 'Google',
    },
    {
      id: 'mistral-large',
      name: 'Mistral Large',
      provider: 'mistral',
      providerLabel: 'Mistral',
    },
  ] as const satisfies readonly ModelSelectorModel[];
  protected readonly modelSelectorGroups = groupModelSelectorModels(this.modelSelectorModels);
  protected readonly sources = [
    {
      href: 'https://docs.stripe.com/api',
      title: 'Stripe API Documentation',
    },
    {
      href: 'https://docs.github.com/en/rest',
      title: 'GitHub REST API',
    },
    {
      href: 'https://docs.aws.amazon.com/sdk-for-javascript',
      title: 'AWS SDK for JavaScript',
    },
  ];

  protected readonly attachmentParts: readonly AiAttachmentPart[] = [
    {
      type: 'file',
      mediaType: 'image/jpeg',
      filename: 'mountain-landscape.jpg',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=640&q=80',
    },
    {
      type: 'file',
      mediaType: 'application/pdf',
      filename: 'quarterly-report.pdf',
      url: 'https://example.com/quarterly-report.pdf',
    },
    {
      type: 'file',
      mediaType: 'video/mp4',
      filename: 'product-demo.mp4',
      url: 'https://example.com/product-demo.mp4',
    },
    {
      type: 'source-document',
      sourceId: 'react-docs',
      mediaType: 'text/html',
      title: 'React Documentation',
      filename: 'react-documentation.html',
    },
    {
      type: 'file',
      mediaType: 'audio/mpeg',
      filename: 'podcast-episode.mp3',
      url: 'https://example.com/podcast-episode.mp3',
    },
  ];

  protected attachmentKey(attachment: AiAttachmentPart): string {
    return attachment.type === 'file'
      ? (attachment.filename ?? attachment.url)
      : attachment.sourceId;
  }

  protected modelSelectorSearchValue(model: ModelSelectorModel): string {
    return createModelSelectorSearchValue(model);
  }

  protected recordPromptSubmit(_event: AiPromptSubmit): void {
    return;
  }

  protected readonly weatherToolPart: AiToolPart = {
    type: 'tool-getWeather',
    toolCallId: 'call-weather-1',
    state: 'output-available',
    input: {
      city: 'London',
      unit: 'celsius',
    },
    output: {
      city: 'London',
      unit: 'celsius',
      temperature: 24,
      condition: 'partly cloudy',
      source: 'storybook-fixture',
    },
  };
  protected readonly chainApprovalPart: AiToolPart = {
    type: 'tool-updateNotes',
    toolCallId: 'call-notes-1',
    state: 'approval-requested',
    input: {
      note: 'Add the selected restaurant and location to the user notes.',
    },
    approval: {
      id: 'approval-notes-1',
    },
  };
  protected readonly confirmationRequestedPart: AiToolPart = {
    type: 'tool-getWeather',
    toolCallId: 'call-confirmation-1',
    state: 'approval-requested',
    input: {
      city: 'London',
      unit: 'celsius',
    },
    approval: {
      id: 'approval-confirmation-1',
    },
  };
}
