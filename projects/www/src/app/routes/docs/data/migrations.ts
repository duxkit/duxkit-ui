import { type ComponentDocSlug } from './component-docs.registry';

export interface MigrationStep {
  readonly id: string;
  readonly title: string;
  readonly components: readonly ComponentDocSlug[];
  readonly explanation: readonly string[];
  readonly before: string;
  readonly after: string;
  readonly imports?: string;
  readonly language?: string;
}

export interface MigrationGuide {
  readonly slug: string;
  readonly fromRelease: string;
  readonly toRelease: string;
  readonly fromCli: string;
  readonly toCli: string;
  readonly description: string;
  readonly steps: readonly MigrationStep[];
  readonly checks: readonly string[];
}

export const migrationGuides: readonly MigrationGuide[] = [
  {
    slug: 'v0-4-1-to-v0-4-2',
    fromRelease: 'v0.4.1',
    toRelease: 'v0.4.2',
    fromCli: '0.1.0',
    toCli: '0.2.0',
    description:
      'Update your component source for custom layouts, controlled prompts and the new attachment defaults.',
    steps: [
      {
        id: 'prompt-status',
        title: 'Move prompt status and disabled state onto the form',
        components: ['prompt-input'],
        explanation: [
          'The submit button no longer accepts status. Move that binding to form[aiPromptInput] so the textarea, Enter key and submit button use the same state.',
          'Put disabled on the form when it should block every submission path. Keeping disabled only on the button disables that control alone. During a response, the built-in button still emits stop.',
        ],
        before: `<form aiPromptInput (promptSubmit)="send($event)">
  <textarea aiPromptInputTextarea aria-label="Message"></textarea>
  <button aiPromptInputSubmit [status]="status()" [disabled]="disabled()"
          (stop)="stopResponse()"></button>
</form>`,
        after: `<form aiPromptInput [status]="status()" [disabled]="disabled()"
      (promptSubmit)="send($event)">
  <textarea aiPromptInputTextarea aria-label="Message"></textarea>
  <button aiPromptInputSubmit (stop)="stopResponse()"></button>
</form>`,
        imports:
          "import { PromptInput, PromptInputTextarea, PromptInputSubmit } from './components/ai/prompt-input';",
      },
      {
        id: 'attachment-preview',
        title: 'Include the default preview when adding your own content',
        components: ['attachment'],
        explanation: [
          'An empty AttachmentPreview still renders the default preview. Once you project content, that content replaces the preset and keeps the order you wrote it in.',
          'If you previously placed a remove button inside the preview, add AttachmentDefaultPreview to keep the filename, thumbnail and hover preview. Add the new export to your component imports too.',
          'Remove buttons now stay visible in normal flow. For positioned controls, choose placement="grid", "list" or "inline-preview" explicitly. Grid placement no longer hides the button until hover.',
        ],
        before: `<ai-attachments variant="inline">
  <ai-attachment [data]="file()" (removed)="removeFile()">
    <ai-attachment-preview>
      <button aiAttachmentRemove></button>
    </ai-attachment-preview>
  </ai-attachment>
</ai-attachments>`,
        after: `<ai-attachments variant="inline">
  <ai-attachment [data]="file()" (removed)="removeFile()">
    <ai-attachment-preview>
      <ai-attachment-default-preview />
      <button aiAttachmentRemove>Remove</button>
    </ai-attachment-preview>
  </ai-attachment>
</ai-attachments>`,
        imports:
          "import { Attachments, Attachment, AttachmentPreview, AttachmentDefaultPreview, AttachmentRemove } from './components/ai/attachment';",
      },
      {
        id: 'image-frame',
        title: 'Add the image frame explicitly',
        components: ['chain-of-thought'],
        explanation: [
          'ChainOfThoughtImage now controls layout without wrapping the image in a frame. Add ChainOfThoughtImageFrame to keep the previous rounded background, padding and height limit.',
          'You can place the caption outside the frame and style each part separately.',
        ],
        before: `<ai-chain-of-thought-image>
  <img [ngSrc]="imageUrl()" width="640" height="360" alt="Search result" />
  <ai-chain-of-thought-image-caption>Search result</ai-chain-of-thought-image-caption>
</ai-chain-of-thought-image>`,
        after: `<figure aiChainOfThoughtImage>
  <div aiChainOfThoughtImageFrame>
    <img [ngSrc]="imageUrl()" width="640" height="360" alt="Search result" />
  </div>
  <figcaption aiChainOfThoughtImageCaption>Search result</figcaption>
</figure>`,
        imports:
          "import { NgOptimizedImage } from '@angular/common';\nimport { ChainOfThoughtImage, ChainOfThoughtImageFrame, ChainOfThoughtImageCaption } from './components/ai/chain-of-thought';",
      },
      {
        id: 'task-styles',
        title: 'Apply task content styles to the host',
        components: ['task'],
        explanation: [
          'TaskContent no longer creates an inner div. Its spacing and border now live on the element carrying aiTaskContent.',
          'Update CSS selectors that target the old inner wrapper. You can now override padding and borders with classes on TaskContent itself.',
        ],
        before: `<ai-task-content class="[&>div]:border-l-0 [&>div]:pl-0">
  <div aiTaskItem>Read the project files</div>
</ai-task-content>`,
        after: `<ai-task-content class="border-l-0 pl-0">
  <div aiTaskItem>Read the project files</div>
</ai-task-content>`,
        imports: "import { TaskContent, TaskItem } from './components/ai/task';",
      },
      {
        id: 'confirmation-styles',
        title: 'Style confirmations inside tools directly',
        components: ['tool', 'confirmation'],
        explanation: [
          'Tool no longer changes the appearance of nested Confirmation components. Add the footer styling you want to the confirmation itself.',
          'The example keeps a confirmation attached to the bottom of a tool. Your existing approval data and actions can stay as they are.',
        ],
        before: `<ai-tool [part]="toolPart()">
  <ai-confirmation [part]="toolPart()">
    <ai-confirmation-request>Approval required</ai-confirmation-request>
  </ai-confirmation>
</ai-tool>`,
        after: `<ai-tool [part]="toolPart()">
  <ai-confirmation [part]="toolPart()"
    class="rounded-t-none rounded-b-lg border-x-0 border-b-0 border-t border-border bg-background px-3 py-2 text-muted-foreground">
    <ai-confirmation-request>Approval required</ai-confirmation-request>
  </ai-confirmation>
</ai-tool>`,
        imports:
          "import { Tool } from './components/ai/tool';\nimport { Confirmation, ConfirmationRequest } from './components/ai/confirmation';",
      },
      {
        id: 'directives',
        title: 'Wrap directives if you create them dynamically',
        components: [
          'shimmer',
          'queue',
          'sources',
          'checkpoint',
          'context',
          'model-selector',
          'reasoning-effort',
        ],
        explanation: [
          'Several pieces that only style an element are now Angular directives, including Shimmer, TaskContent and layout or label pieces in attachments, queues, sources and chain of thought. Their exported names and template selectors stay the same.',
          'Normal template imports still work. If you instantiate one with createComponent(), NgComponentOutlet or a ComponentPortal, wrap its template in a small component and instantiate that wrapper instead. The example shows Shimmer.',
        ],
        language: 'ts',
        before: `import { Shimmer } from './components/ai/shimmer';

// Inside a class with a ViewContainerRef named container:
this.container.createComponent(Shimmer);`,
        after: `import { Component } from '@angular/core';
import { Shimmer } from './components/ai/shimmer';

@Component({
  imports: [Shimmer],
  template: '<span aiShimmer>Generating a response...</span>',
})
export class LoadingMessage {}

// Inside a class with a ViewContainerRef named container:
this.container.createComponent(LoadingMessage);`,
      },
      {
        id: 'projected-content',
        title: 'Check content projected into preset components',
        components: ['code-block', 'message', 'reasoning'],
        explanation: [
          'CodeBlock now renders projected content in place of its default toolbar and code body. If you add a custom button, include CodeBlockContent to keep the code visible.',
          'The same replacement-content pattern is available on ModelSelectorInput, PromptInputAttachments and ReasoningEffortSlider. Review any previously ignored children inside those presets before upgrading.',
        ],
        before: `<ai-code-block [code]="source()" language="ts" />`,
        after: `<ai-code-block [code]="source()" language="ts">
  <button aiCodeBlockCopy>Copy source</button>
  <ai-code-block-content />
</ai-code-block>`,
        imports:
          "import { CodeBlock, CodeBlockCopy, CodeBlockContent } from './components/ai/code-block';",
      },
      {
        id: 'behaviour',
        title: 'Opt in to sending another prompt during a response',
        components: ['prompt-input'],
        explanation: [
          'PromptInput.submit() now blocks concurrent submissions and submissions during generation. If your app intentionally sends another prompt while a response is in progress, opt in with allowSubmitWhileGenerating. The standard busy button remains a stop control; use an explicit submit action for that flow.',
          'The example assumes submitAnotherPrompt() previously called PromptInput.submit() directly. Existing apps that send one prompt at a time do not need this opt-in.',
        ],
        before: `<form aiPromptInput [status]="status()" (promptSubmit)="send($event)">
  <textarea aiPromptInputTextarea aria-label="Message"></textarea>
  <button type="button" (click)="submitAnotherPrompt()">Send another prompt</button>
</form>`,
        after: `<form aiPromptInput #prompt="aiPromptInput" [status]="status()"
      [allowSubmitWhileGenerating]="true" (promptSubmit)="send($event)">
  <textarea aiPromptInputTextarea aria-label="Message"></textarea>
  <button type="button" [disabled]="!prompt.canSubmit()" (click)="prompt.submit()">
    Send another prompt
  </button>
</form>`,
        imports: "import { PromptInput, PromptInputTextarea } from './components/ai/prompt-input';",
      },
      {
        id: 'clear-form',
        title: 'Reset other form fields explicitly',
        components: ['prompt-input'],
        explanation: [
          'PromptInput.clear() and automatic clearing now reset only prompt text and attachments. If you relied on them to reset every native form field, reset the form explicitly. Here, prompt is your PromptInput instance and form is an ElementRef<HTMLFormElement>. For Angular form models, use their reset API as appropriate.',
          'For async sends, set resetOnSubmit=false and clear after success. Before clearing, check that the draft still belongs to that send so you do not erase a newer message.',
          'The root revokes object URLs it creates. Your app must revoke any blob URLs it supplies externally when they are no longer needed.',
        ],
        language: 'ts',
        before: `// Clear the prompt and reset the other native form fields.
this.prompt.clear();`,
        after: `// Clear the prompt, then explicitly reset the other native form fields.
this.prompt.clear();
this.form.nativeElement.reset();`,
      },
      {
        id: 'auto-scroll',
        title: 'Choose whether new messages should scroll the chat',
        components: ['conversation'],
        explanation: [
          'Conversation now respects stickToBottom=false for every automatic scroll path. If that is the behaviour you want, keep it false. Set it to true if your app previously relied on new messages scrolling despite that setting.',
          'You can also keep automatic scrolling off and call ConversationContent.scrollToBottom() for a user-requested jump. Custom renderers can set observeMessages=false and call notifyMessageAdded(role) after rendering a new message.',
        ],
        before: `<ai-conversation [stickToBottom]="false">
  <ai-conversation-content>
    <ai-message from="assistant"><ai-message-content [markdown]="answer()" /></ai-message>
  </ai-conversation-content>
</ai-conversation>`,
        after: `<ai-conversation [stickToBottom]="true">
  <ai-conversation-content>
    <ai-message from="assistant"><ai-message-content [markdown]="answer()" /></ai-message>
  </ai-conversation-content>
</ai-conversation>`,
        imports:
          "import { Conversation, ConversationContent } from './components/ai/conversation';\nimport { Message, MessageContent } from './components/ai/message';",
      },
      {
        id: 'initial-expansion',
        title: 'Set the initial open state of thought panels',
        components: ['chain-of-thought'],
        explanation: [
          'ChainOfThought now keeps the initial expanded state you provide. If you previously relied on isStreaming=true opening the panel on first render, set expanded=true too.',
          'Later streaming transitions still auto-toggle unless autoToggle=false or the user has toggled the trigger. Use autoToggle=false when your app should own the open state throughout.',
        ],
        before: `<ai-chain-of-thought [isStreaming]="true">
  <button aiChainOfThoughtTrigger>Thinking</button>
  <ai-chain-of-thought-content>Reading the project files</ai-chain-of-thought-content>
</ai-chain-of-thought>`,
        after: `<ai-chain-of-thought [isStreaming]="true" [expanded]="true">
  <button aiChainOfThoughtTrigger>Thinking</button>
  <ai-chain-of-thought-content>Reading the project files</ai-chain-of-thought-content>
</ai-chain-of-thought>`,
        imports:
          "import { ChainOfThought, ChainOfThoughtTrigger, ChainOfThoughtContent } from './components/ai/chain-of-thought';",
      },
    ],
    checks: [
      'Build your app and resolve removed status bindings, missing imports and dynamic component errors.',
      'Submit with Enter and with the button; confirm disabled, streaming and stop states behave as intended.',
      'Check draft retention after failed sends and whether other form controls still need an explicit reset.',
      'Check grid, list and inline attachments, including previews, keyboard access and remove-button placement.',
      'Review image frames, task spacing, tool approvals and custom CSS in light and dark themes.',
      'Stream a response with auto-scroll both enabled and disabled; check the initial and subsequent expansion of thought panels.',
      'Reapply your saved component customisations, then run your app tests and accessibility checks.',
    ],
  },
];

export function migrationHref(guide: MigrationGuide): string {
  return `/docs/migrations/${guide.slug}`;
}

export function migrationForRelease(version: string): MigrationGuide | undefined {
  return migrationGuides.find((guide) => guide.toRelease === version);
}

export function migrationForComponent(slug: ComponentDocSlug) {
  for (const guide of migrationGuides) {
    const step = guide.steps.find((step) => step.components.includes(slug));
    if (step) return { guide, fragment: step.id };
  }
  return undefined;
}
