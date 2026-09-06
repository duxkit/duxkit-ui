import { type ComponentDocSlug } from './component-docs.registry';

export const componentImports: Record<ComponentDocSlug, string> = {
  conversation:
    "import { Conversation, ConversationContent, ConversationScrollAnchor } from './components/ai/conversation';\nimport { Message, MessageContent } from './components/ai/message';",
  message:
    "import { Message, MessageActions, MessageContent, MessageCopy } from './components/ai/message';",
  checkpoint:
    "import { Checkpoint, CheckpointIcon, CheckpointTrigger } from './components/ai/checkpoint';",
  context:
    "import { Context, ContextContent, ContextContentBody, ContextContentFooter, ContextContentHeader, ContextIcon, ContextInputUsage, ContextOutputUsage, ContextPercentage, ContextTrigger } from './components/ai/context';",
  'model-selector':
    "import { ModelSelector, ModelSelectorContent, ModelSelectorDescription, ModelSelectorEmpty, ModelSelectorGroup, ModelSelectorGroupHeading, ModelSelectorInput, ModelSelectorItem, ModelSelectorList, ModelSelectorLogo, ModelSelectorName, ModelSelectorShortcut, ModelSelectorTitle, ModelSelectorTrigger } from './components/ai/model-selector';",
  'prompt-input':
    "import { ModelSelector, ModelSelectorContent, ModelSelectorDescription, ModelSelectorEmpty, ModelSelectorGroup, ModelSelectorGroupHeading, ModelSelectorInput, ModelSelectorItem, ModelSelectorList, ModelSelectorLogo, ModelSelectorName, ModelSelectorTitle, ModelSelectorTrigger } from './components/ai/model-selector';\nimport { PromptInput, PromptInputAddAttachment, PromptInputAttachments, PromptInputSubmit, PromptInputTextarea, PromptInputToolbar, PromptInputTools } from './components/ai/prompt-input';",
  queue:
    "import { Queue, QueueItem, QueueItemAction, QueueItemActions, QueueItemAttachment, QueueItemContent, QueueItemDescription, QueueItemFile, QueueItemImage, QueueItemIndicator, QueueList, QueueSection, QueueSectionContent, QueueSectionCount, QueueSectionLabel, QueueSectionTrigger } from './components/ai/queue';",
  attachment:
    "import { Attachment, AttachmentPreview, AttachmentRemove, Attachments } from './components/ai/attachment';",
  'chain-of-thought':
    "import { ChainOfThought, ChainOfThoughtContent, ChainOfThoughtImage, ChainOfThoughtImageFrame, ChainOfThoughtImageCaption, ChainOfThoughtStep, ChainOfThoughtStepDescription, ChainOfThoughtStepIcon, ChainOfThoughtStepLabel, ChainOfThoughtTrigger } from './components/ai/chain-of-thought';",
  task: "import { Task, TaskContent, TaskItem, TaskItemFile, TaskTrigger } from './components/ai/task';",
  tool: "import { Tool, ToolContent, ToolTrigger } from './components/ai/tool';",
  reasoning:
    "import { Reasoning, ReasoningContent, ReasoningTrigger } from './components/ai/reasoning';",
  'reasoning-effort':
    "import { ReasoningEffort, ReasoningEffortContent, ReasoningEffortItem, ReasoningEffortLabel, ReasoningEffortList, ReasoningEffortSlider, ReasoningEffortTrigger, ReasoningEffortValue } from './components/ai/reasoning-effort';",
  sources:
    "import { Source, Sources, SourcesContent, SourcesTrigger } from './components/ai/sources';",
  confirmation:
    "import { Confirmation, ConfirmationAction, ConfirmationActions, ConfirmationRequest, ConfirmationTitle } from './components/ai/confirmation';",
  'code-block':
    "import { CodeBlock, CodeBlockRoot, CodeBlockHeader, CodeBlockLanguage, CodeBlockContent, CodeBlockCopy, CodeBlockDownload } from './components/ai/code-block';",
  shimmer: "import { Shimmer } from './components/ai/shimmer';",
};

export const anatomySnippets: Record<ComponentDocSlug, string> = {
  conversation: `<ai-conversation>
  <ai-conversation-content>
    <ai-message from="assistant">
      <ai-message-content markdown="Hello from your AI assistant." />
    </ai-message>
    <div aiConversationScrollAnchor></div>
  </ai-conversation-content>
</ai-conversation>`,
  message: `<ai-message from="assistant">
  <ai-message-content markdown="Message content supports markdown." />
  <ai-message-actions>
    <button aiMessageCopy aria-label="Copy message"></button>
  </ai-message-actions>
</ai-message>`,
  checkpoint: `<ai-checkpoint>
  <ai-checkpoint-icon />
  <button aiCheckpointTrigger>Restore checkpoint</button>
</ai-checkpoint>`,
  context: `<ai-context [usedTokens]="40000" [maxTokens]="128000" [usage]="usage" modelId="openai:gpt-4o-mini">
  <button aiContextTrigger>
    <ai-context-percentage />
    <ai-context-icon />
  </button>
  <ai-context-content>
    <ai-context-content-header />
    <ai-context-content-body>
      <ai-context-input-usage />
      <ai-context-output-usage />
    </ai-context-content-body>
    <ai-context-content-footer />
  </ai-context-content>
</ai-context>`,
  'model-selector': `<ai-model-selector>
  <button aiModelSelectorTrigger>
    <ai-model-selector-logo provider="openai" />
    <ai-model-selector-name>GPT-4.1</ai-model-selector-name>
  </button>
  <ai-model-selector-content>
    <h2 aiModelSelectorTitle class="sr-only">Choose a model</h2>
    <p aiModelSelectorDescription class="sr-only">Search and select an AI model.</p>
    <ai-model-selector-input placeholder="Search models..." />
    <ai-model-selector-list>
      <ai-model-selector-empty>No models found.</ai-model-selector-empty>
      <ai-model-selector-group>
        <ai-model-selector-group-heading>OpenAI</ai-model-selector-group-heading>
        <button aiModelSelectorItem value="gpt-4.1 GPT-4.1 openai OpenAI">
          <ai-model-selector-logo provider="openai" />
          <ai-model-selector-name>GPT-4.1</ai-model-selector-name>
        </button>
      </ai-model-selector-group>
    </ai-model-selector-list>
  </ai-model-selector-content>
</ai-model-selector>`,
  'prompt-input': `<form aiPromptInput (promptSubmit)="sendMessage($event)">
  <textarea aiPromptInputTextarea placeholder="Ask a question..."></textarea>
  <ai-prompt-input-attachments />
  <ai-prompt-input-toolbar>
    <ai-prompt-input-tools>
      <ai-model-selector>
        <button aiModelSelectorTrigger>
          <ai-model-selector-logo provider="openai" />
          <ai-model-selector-name>GPT-4.1</ai-model-selector-name>
        </button>
        <ai-model-selector-content>
          <h2 aiModelSelectorTitle class="sr-only">Choose a model</h2>
          <p aiModelSelectorDescription class="sr-only">Search and select an AI model.</p>
          <ai-model-selector-input placeholder="Search models..." />
          <ai-model-selector-list>
            <ai-model-selector-empty>No models found.</ai-model-selector-empty>
            <ai-model-selector-group>
              <ai-model-selector-group-heading>OpenAI</ai-model-selector-group-heading>
              <button aiModelSelectorItem value="gpt-4.1 GPT-4.1 openai OpenAI">
                <ai-model-selector-logo provider="openai" />
                <ai-model-selector-name>GPT-4.1</ai-model-selector-name>
              </button>
            </ai-model-selector-group>
          </ai-model-selector-list>
        </ai-model-selector-content>
      </ai-model-selector>
      <button aiPromptInputAddAttachment>Add attachment</button>
    </ai-prompt-input-tools>
    <button aiPromptInputSubmit></button>
  </ai-prompt-input-toolbar>
</form>`,
  queue: `<ai-queue>
  <ai-queue-section>
    <button aiQueueSectionTrigger>
      <ai-queue-section-label>
        <span aiQueueSectionCount>{{ items.length }}</span>
        <span>queued tasks</span>
      </ai-queue-section-label>
    </button>
    <ai-queue-section-content>
      <ai-queue-list>
        @for (item of items; track item.id) {
          <ai-queue-item>
            <div class="flex items-start gap-3">
              <span aiQueueItemIndicator [completed]="item.status === 'completed'"></span>
              <span aiQueueItemContent [completed]="item.status === 'completed'">
                {{ item.title }}
              </span>
            </div>
            @if (item.description) {
              <ai-queue-item-description [completed]="item.status === 'completed'">
                {{ item.description }}
              </ai-queue-item-description>
            }
          </ai-queue-item>
        }
      </ai-queue-list>
    </ai-queue-section-content>
  </ai-queue-section>
</ai-queue>`,
  attachment: `<ai-attachments variant="grid">
  @for (attachment of attachments; track attachmentKey(attachment)) {
    <ai-attachment [data]="attachment" (removed)="removeAttachment(attachment)">
      <ai-attachment-preview />
      <button aiAttachmentRemove placement="grid" hlmBtn variant="ghost" size="icon-sm"></button>
    </ai-attachment>
  }
</ai-attachments>`,
  'chain-of-thought': `<ai-chain-of-thought>
  <button aiChainOfThoughtTrigger></button>
  <ai-chain-of-thought-content>
    <ai-chain-of-thought-step status="complete">
      <ai-chain-of-thought-step-icon>Done</ai-chain-of-thought-step-icon>
      <ai-chain-of-thought-step-label>Read files</ai-chain-of-thought-step-label>
      <ai-chain-of-thought-step-description>
        Read matching docs.
      </ai-chain-of-thought-step-description>
    </ai-chain-of-thought-step>
  </ai-chain-of-thought-content>
</ai-chain-of-thought>`,
  task: `<ai-task>
  <button aiTaskTrigger>Update docs</button>
  <ai-task-content>
    <div aiTaskItem>Changed <span aiTaskItemFile>component-doc.page.ts</span></div>
  </ai-task-content>
</ai-task>`,
  tool: `<ai-tool [part]="toolPart">
  <button aiToolTrigger></button>
  <ai-tool-content>Tool call details</ai-tool-content>
</ai-tool>`,
  reasoning: `<ai-reasoning [expanded]="true">
  <button aiReasoningTrigger>Thought for 8 seconds</button>
  <ai-reasoning-content markdown="Summarized reasoning can render here." />
</ai-reasoning>`,
  'reasoning-effort': `<ai-reasoning-effort [(value)]="effort" [levels]="levels">
  <button
    aiReasoningEffortTrigger
    class="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
    Reasoning effort: <span aiReasoningEffortValue></span>
  </button>
  <ai-reasoning-effort-content>
    <div class="flex items-center justify-between">
      <ai-reasoning-effort-label />
      <ai-reasoning-effort-value />
    </div>
    <ai-reasoning-effort-slider />

    <!-- Or replace the slider with a generated list. -->
    <!-- <ai-reasoning-effort-list /> -->

    <!-- A list can also contain custom items. -->
    <!--
    <ai-reasoning-effort-list>
      <button aiReasoningEffortItem value="low">Fast</button>
      <button aiReasoningEffortItem value="high">Deep</button>
    </ai-reasoning-effort-list>
    -->
  </ai-reasoning-effort-content>
</ai-reasoning-effort>`,
  sources: `<ai-sources [expanded]="true">
  <button aiSourcesTrigger [count]="sources.length"></button>
  <ai-sources-content>
    @for (source of sources; track source.href) {
      <a aiSource [href]="source.href" [title]="source.title"></a>
    }
  </ai-sources-content>
</ai-sources>`,
  confirmation: `<ai-confirmation [part]="toolPart">
  <ai-confirmation-request>
    <ai-confirmation-title />
    <ai-confirmation-actions>
      <button aiConfirmationAction>Deny</button>
      <button aiConfirmationAction>Allow</button>
    </ai-confirmation-actions>
  </ai-confirmation-request>
</ai-confirmation>`,
  'code-block': `<ai-code-block language="ts" [code]="code" />`,
  shimmer: `<p aiShimmer>
  Generating a response from the model...
</p>`,
};
