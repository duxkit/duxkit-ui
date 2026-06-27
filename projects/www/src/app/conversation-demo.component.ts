import { Component } from '@angular/core';
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
  ChainOfThoughtTrigger,
  Conversation,
  ConversationContent,
  ConversationScrollAnchor,
  Message,
  MessageContent,
  ReasoningContent,
  Task,
  TaskContent,
  TaskItem,
  TaskItemFile,
  TaskTrigger,
} from 'duxkit-ai';

@Component({
  imports: [
    ChainOfThought,
    ChainOfThoughtContent,
    ChainOfThoughtSearchResult,
    ChainOfThoughtSearchResults,
    ChainOfThoughtStep,
    ChainOfThoughtTrigger,
    Conversation,
    ConversationContent,
    ConversationScrollAnchor,
    Message,
    MessageContent,
    ReasoningContent,
    Task,
    TaskContent,
    TaskItem,
    TaskItemFile,
    TaskTrigger,
  ],
  selector: 'app-conversation-demo',
  template: `
    <div class="conversation-perspective" aria-label="Conversation demo preview">
      <div class="conversation-plane h-[32rem] px-5 border-border border-gray-200 border rounded-xl">
        <ai-conversation [stickToBottom]="'auto'">
          <ai-conversation-content
            class="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-live="polite"
          >
            <ai-message from="user" class="mt-3">
              <ai-message-content
                markdown="Can you help me plan a quiet weekend in Lisbon? I want a nice hotel, good food, and no tourist traps."
              />
            </ai-message>

            <ai-message from="assistant">
              <ai-message-content
                markdown="Absolutely. I’ll compare quieter areas, keep food local, and ask before holding anything."
              />

              <ai-chain-of-thought [autoToggle]="false" [expanded]="true" [isStreaming]="false">
                <button aiChainOfThoughtTrigger></button>
                <ai-chain-of-thought-content>
                  <ai-chain-of-thought-step
                    status="complete"
                    icon="lucideCircleCheck"
                    label="Understand the trip"
                    description="Quiet Lisbon weekend, good food, nice hotel, fewer tourist traps."
                  />

                  <ai-chain-of-thought-step
                    status="complete"
                    icon="lucideCircleCheck"
                    label="Compare neighborhoods"
                    description="Favor calm areas with restaurants and refundable stays."
                  >
                    <ai-reasoning-content
                      markdown="Prioritize Principe Real, Estrela, and Lapa. Look for walkable restaurants, a calm hotel, and refundable availability."
                    />
                  </ai-chain-of-thought-step>
                </ai-chain-of-thought-content>
              </ai-chain-of-thought>
            </ai-message>

            <ai-message from="user">
              <ai-message-content markdown="Great. Can you also find somewhere nearby for dinner?" />
            </ai-message>

            <ai-message from="assistant">
              <ai-chain-of-thought [autoToggle]="false" [expanded]="true" [isStreaming]="false">
                <button aiChainOfThoughtTrigger></button>
                <ai-chain-of-thought-content>
                  <ai-chain-of-thought-step
                    status="complete"
                    icon="lucideGlobe"
                    label="Search nearby dinner spots"
                    description="Find relaxed restaurants near Principe Real."
                  >
                    <ai-chain-of-thought-search-results>
                      <span aiChainOfThoughtSearchResult>Taberna Rua das Flores</span>
                      <span aiChainOfThoughtSearchResult>Prado</span>
                      <span aiChainOfThoughtSearchResult>O Velho Eurico</span>
                    </ai-chain-of-thought-search-results>
                  </ai-chain-of-thought-step>
                </ai-chain-of-thought-content>
              </ai-chain-of-thought>

              <ai-message-content
                markdown="I found a nearby option that fits: a small Portuguese restaurant about 8 minutes away, with petiscos, grilled fish, and a quieter late seating."
              />
            </ai-message>

            <ai-message from="assistant">
              <ai-task [autoToggle]="false" [expanded]="true" [isStreaming]="false">
                <button aiTaskTrigger>Update travel notes</button>
                <ai-task-content>
                  <div aiTaskItem>
                    Added hotel area to <span aiTaskItemFile>lisbon_2026.docx</span>
                  </div>
                  <div aiTaskItem>
                    Added dinner picks to <span aiTaskItemFile>lisbon_2026.docx</span>
                  </div>
                </ai-task-content>
              </ai-task>
            </ai-message>

            <div aiConversationScrollAnchor></div>
          </ai-conversation-content>
        </ai-conversation>
      </div>
    </div>
  `,
})
export class ConversationDemoComponent {}
