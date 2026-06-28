import { Component, input } from '@angular/core';
import { HlmButton } from '@duxkit/ui/helm/button';
import {
  type AiToolPart,
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtImage,
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
  ChainOfThoughtTrigger,
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
  Message,
  MessageActions,
  MessageActionsCopy,
  MessageContent,
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
  Task,
  TaskContent,
  TaskItem,
  TaskItemFile,
  TaskTrigger,
  Tool,
  ToolContent,
  ToolTrigger,
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
};

@Component({
  selector: 'app-component-doc-preview',
  imports: [
    ChainOfThought,
    ChainOfThoughtContent,
    ChainOfThoughtImage,
    ChainOfThoughtSearchResult,
    ChainOfThoughtSearchResults,
    ChainOfThoughtStep,
    ChainOfThoughtTrigger,
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
    HlmButton,
    Message,
    MessageActions,
    MessageActionsCopy,
    MessageContent,
    Reasoning,
    ReasoningContent,
    ReasoningTrigger,
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
