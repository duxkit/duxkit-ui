import { type ComponentDocSlug } from './component-docs.registry';

export interface ComponentComposition {
  readonly notes: readonly string[];
  readonly migration?: string;
  readonly imports?: string;
  readonly template?: string;
}

/** Consumer guidance alongside generated API tables; examples use app-owned state. */
export const componentComposition: Record<ComponentDocSlug, ComponentComposition> = {
  conversation: {
    notes: [
      'ConversationContent exposes atBottom(), scrollToBottom(behavior?) and notifyMessageAdded(role?). For custom or virtualized renderers, set observeMessages=false and notify after rendering each new message. The scroll anchor is optional.',
      'stickToBottom=false disables every automatic scroll path. An explicit scrollToBottom() call still permits a user-requested jump.',
    ],
  },
  message: {
    notes: [
      'Provide codeTemplate to replace fenced code rendering while retaining markdown parsing. Its MarkdownCodeContext supplies the block through $implicit, including code and language.',
      'Project custom content without a markdown input when your application owns the complete renderer. Message actions remain independently composable.',
    ],
    imports:
      "import { Message, MessageContent } from './components/ai/message';\nimport { CodeBlock, CodeBlockCopy, CodeBlockContent } from './components/ai/code-block';",
    template: `<ng-template #fence let-block>
  <ai-code-block [code]="block.code" [language]="block.language">
    <button aiCodeBlockCopy>Copy example</button>
    <ai-code-block-content />
  </ai-code-block>
</ng-template>
<ai-message from="assistant">
  <ai-message-content [markdown]="answer()" [codeTemplate]="fence" />
</ai-message>`,
  },
  checkpoint: {
    notes: [
      'Set showSeparator=false to omit the default separator. Compose the icon and restore trigger independently, or project a custom label into the trigger.',
    ],
  },
  context: {
    notes: [
      'ContextData provides token and cost state independently of hover presentation. Context retains the hover-card preset. A ContextTrigger can target a wrapper-provided BrnHoverCardContent through contentTarget.',
      'Usage rows preserve projected content when token counts are zero. Set showZero=true to also display the default zero-value row.',
    ],
    imports:
      "import { ContextData, ContextPercentage, ContextInputUsage } from './components/ai/context';",
    template: `<section aiContextData [usedTokens]="usedTokens()" [maxTokens]="maxTokens()" [usage]="usage()">
  <p>Context used: <ai-context-percentage /></p>
  <ai-context-input-usage [showZero]="true" />
</section>`,
  },
  'model-selector': {
    notes: [
      'ModelSelectorCommand provides search, filtering and selection without a dialog. ModelSelectorNativeInput attaches behavior directly to input[aiModelSelectorInput], so native attributes and other directives reach the input. ModelSelectorSearch is an optional wrapper.',
      'Both command and dialog content expose filter, search, searchChange, valueChange and disabled. On the dialog root, overlayClass styles the overlay; showOverlay=false permits your own Brain overlay.',
      'ModelSelectorLogo accepts a custom src without provider, and projected content supplies its image-error fallback.',
    ],
    imports:
      "import { ModelSelectorCommand, ModelSelectorNativeInput, ModelSelectorList, ModelSelectorItem, ModelSelectorEmpty } from './components/ai/model-selector';",
    template: `<section aiModelSelectorCommand (valueChange)="selectModel($event)">
  <input aiModelSelectorInput aria-label="Search models" placeholder="Search models..." />
  <ai-model-selector-list>
    <ai-model-selector-empty>No models found.</ai-model-selector-empty>
    @for (model of models(); track model.id) {
      <button aiModelSelectorItem [value]="model.id">{{ model.name }}</button>
    }
  </ai-model-selector-list>
</section>`,
  },
  'prompt-input': {
    notes: [
      'Bind text and files on the root with two-way signal models. Use addFiles() for upload validation. Locally created object URLs are revoked on removal, replacement and destruction; consumer-supplied URLs remain consumer-owned.',
      'Set resetOnSubmit=false and call clear() after async success to retain the draft until your application accepts it. Clearing only resets the draft, leaving other form controls intact. PromptInputAttachments accepts a replacement renderer.',
      'Every submission path respects root disabled and generation status. allowSubmitWhileGenerating opts into additional prompts during generation. canSubmit() also guards concurrent submissions.',
    ],
    migration:
      'Move status from PromptInputSubmit onto form[aiPromptInput]; the button status input was removed. Put submission-wide disabled on the root too. A disabled button affects that control alone. Bind external draft state at the root rather than adding a second value owner to the textarea.',
    imports:
      "import { PromptInput, PromptInputTextarea, PromptInputSubmit } from './components/ai/prompt-input';",
    template: `<form aiPromptInput #prompt="aiPromptInput" [(text)]="draft" [(files)]="files"
      [status]="status()" [disabled]="disabled()" [resetOnSubmit]="false"
      (promptSubmit)="send($event)">
  <textarea aiPromptInputTextarea aria-label="Message"></textarea>
  <button aiPromptInputSubmit (stop)="stopResponse()"></button>
</form>`,
  },
  queue: {
    notes: [
      'Queue layout and label pieces are directives, allowing them to share a host with other components. QueueItemFile accepts arbitrary content without an internal label wrapper.',
      'Set showIcon=false on QueueItemFile or QueueSectionLabel to omit their preset decorations.',
    ],
  },
  attachment: {
    notes: [
      'AttachmentPreview renders projected content in consumer order. Leave it empty for the preset, or compose thumbnails, names, media types and custom wrappers yourself.',
    ],
    migration:
      'When combining the preset preview with other projected content, include AttachmentDefaultPreview explicitly. AttachmentRemove now defaults to visible normal flow. Choose placement="grid", "list" or "inline-preview" for explicit positioning; removal visibility no longer depends on hover or nesting.',
    imports:
      "import { Attachments, Attachment, AttachmentPreview, AttachmentDefaultPreview, AttachmentRemove } from './components/ai/attachment';",
    template: `<ai-attachments variant="inline">
  <ai-attachment [data]="file()" (removed)="removeFile()">
    <ai-attachment-preview>
      <ai-attachment-default-preview />
      <button aiAttachmentRemove>Remove</button>
    </ai-attachment-preview>
  </ai-attachment>
</ai-attachments>`,
  },
  'chain-of-thought': {
    notes: [
      'Initial expanded state is preserved. Streaming transitions auto-toggle the root unless autoToggle=false or the trigger establishes a manual override.',
      'ChainOfThoughtStep accepts a layout template whose $implicit is the step instance. It shares controlled expanded, hasOverflow(), expandContent() and collapseContent() with ReasoningContent. Set showControls=false to place your own controls elsewhere.',
      'Label, icon, description and image layout pieces are directives, so labels can share an element with Shimmer.',
    ],
    migration:
      'ChainOfThoughtImage now styles its host. Wrap images in ChainOfThoughtImageFrame to retain the previous frame; captions can be placed independently.',
    imports:
      "import { NgOptimizedImage } from '@angular/common';\nimport { ChainOfThoughtImage, ChainOfThoughtImageFrame, ChainOfThoughtImageCaption } from './components/ai/chain-of-thought';",
    template: `<figure aiChainOfThoughtImage>
  <div aiChainOfThoughtImageFrame>
    <img [ngSrc]="imageUrl()" width="640" height="360" alt="Supporting evidence" />
  </div>
  <figcaption aiChainOfThoughtImageCaption>Supporting evidence</figcaption>
</figure>`,
  },
  task: {
    notes: [
      'Compose TaskTrigger, TaskContent, TaskItem and TaskItemFile on consumer-owned hosts. Styling-only pieces can share an element with another component.',
    ],
    migration:
      'TaskContent now applies padding and border to its host, without an internal wrapper. Apply overrides directly to that host.',
  },
  tool: {
    notes: [
      'ToolStatus accepts projected replacement content. ToolTrigger and ToolContent remain independent pieces for composing custom headers and results.',
    ],
    migration:
      'Tool no longer styles nested Confirmation components. Apply the desired confirmation/footer classes directly in your composition.',
  },
  reasoning: {
    notes: [
      'ReasoningContent accepts codeTemplate for custom markdown code fences, and controlled expanded for clipped content. Set showControls=false to place external expansion controls; hasOverflow(), expandContent() and collapseContent() are public.',
      'ContentClampDirective exposes the same clipping behavior on a native element. The outer Reasoning expansion and the content clamp expansion are independent states.',
    ],
    imports: "import { ContentClampDirective } from './components/ai/reasoning';",
    template: `<div id="reasoning-details" aiContentClamp #clamp="aiContentClamp"
     [collapsedMaxHeight]="160" [(expanded)]="expanded">{{ longText() }}</div>
<button type="button" aria-controls="reasoning-details"
        [attr.aria-expanded]="clamp.expanded()"
        (click)="clamp.expanded.set(!clamp.expanded())">Toggle details</button>`,
  },
  'reasoning-effort': {
    notes: [
      'ReasoningEffortSlider accepts projected replacement markup and forwards orientation. ReasoningEffortSliderState supplies maxIndex(), sliderValue(), isDisabled() and selectSliderValue(values) for your own Brain slider composition.',
      'Bind the mapping to slider max, value, disabled and valueChange, then arrange track, range, thumb and labels yourself. The root model, trigger, content and list can also be composed independently.',
    ],
  },
  sources: {
    notes: [
      'SourcesTrigger.count is optional when you replace its label. SourcesContent is a directive, so it can share a native or component host with other behavior.',
    ],
  },
  confirmation: {
    notes: [
      'Supply approval data on the root and compose the request, accepted or rejected state with custom actions. The root and styling-only pieces are directives; containers and labels remain under your control.',
    ],
  },
  'code-block': {
    notes: [
      'CodeBlockRoot provides code, language, highlighted output, copied state, copy() and download(). Arrange CodeBlockHeader, CodeBlockLanguage, CodeBlockActions, CodeBlockContent, CodeBlockCopy and CodeBlockDownload independently.',
      'CodeBlock renders its preset when empty; projected content replaces that preset. CodeBlockContent includes highlighting styles independently. Consumer utility classes override the default presentation.',
    ],
    imports:
      "import { CodeBlockRoot, CodeBlockHeader, CodeBlockLanguage, CodeBlockContent, CodeBlockCopy, CodeBlockDownload } from './components/ai/code-block';",
    template: `<section aiCodeBlockRoot [code]="source()" language="ts">
  <div aiCodeBlockHeader>
    <span aiCodeBlockLanguage></span>
    <button aiCodeBlockCopy>Copy source</button>
  </div>
  <ai-code-block-content />
  <button aiCodeBlockDownload>Download</button>
</section>`,
  },
  shimmer: {
    notes: [
      'Shimmer is a directive, allowing it to share a host with another component or styling directive. It uses native animation, respects reduced motion and cleans up when destroyed.',
    ],
  },
};
