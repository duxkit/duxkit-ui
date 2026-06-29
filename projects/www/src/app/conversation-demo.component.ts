import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  WritableSignal,
  inject,
  signal,
} from '@angular/core';
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
import { revealConversationText } from './conversation-demo-timeline';

const introAssistantMessage =
  'Absolutely. I’ll compare quieter areas, keep food local, and ask before holding anything.';
const dinnerAssistantMessage =
  'I found a nearby option that fits: a small Portuguese restaurant about 8 minutes away, with petiscos, grilled fish, and a quieter late seating.';

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
            class="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden space-y-4 py-3"
            aria-live="polite"
          >
            @if (showInitialUser()) {
              <ai-message from="user" animate.enter="message-enter-right">
                <ai-message-content
                  markdown="Can you help me plan a quiet weekend in Lisbon? I want a nice hotel, good food, and no tourist traps."
                />
              </ai-message>
            }

            @if (showIntroAssistant()) {
              <ai-message from="assistant" animate.enter="message-enter-left">
                <ai-message-content [markdown]="introAssistantMarkdown()" />

                @if (showIntroReasoning()) {
                  <ai-chain-of-thought
                    animate.enter="step-enter"
                    [autoToggle]="false"
                    [expanded]="true"
                    [isStreaming]="false"
                  >
                    <button aiChainOfThoughtTrigger></button>
                    <ai-chain-of-thought-content>
                      <ai-chain-of-thought-step
                        animate.enter="step-enter delay-1"
                        status="complete"
                        icon="lucideCircleCheck"
                        label="Understand the trip"
                        description="Quiet Lisbon weekend, good food, nice hotel, fewer tourist traps."
                      />

                      <ai-chain-of-thought-step
                        animate.enter="step-enter delay-2"
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
                }
              </ai-message>
            }

            @if (showDinnerUser()) {
              <ai-message from="user" animate.enter="message-enter-right">
                <ai-message-content
                  markdown="Great. Can you also find somewhere nearby for dinner?"
                />
              </ai-message>
            }

            @if (showDinnerAssistant()) {
              <ai-message from="assistant" animate.enter="message-enter-left">
                @if (showDinnerSearch()) {
                  <ai-chain-of-thought
                    animate.enter="step-enter"
                    [autoToggle]="false"
                    [expanded]="true"
                    [isStreaming]="dinnerAssistantStreaming()"
                  >
                    <button aiChainOfThoughtTrigger></button>
                    <ai-chain-of-thought-content>
                      <ai-chain-of-thought-step
                        animate.enter="step-enter"
                        [status]="dinnerAssistantStreaming() ? 'active' : 'complete'"
                        [icon]="dinnerAssistantStreaming() ? 'lucideLoaderCircle' : 'lucideGlobe'"
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
                }

                @if (dinnerAssistantMarkdown()) {
                  <ai-message-content
                    animate.enter="step-enter"
                    [markdown]="dinnerAssistantMarkdown()"
                  />
                }
              </ai-message>
            }

            @if (showTaskUpdate()) {
              <ai-message from="assistant" animate.enter="message-enter-left">
                <ai-task
                  animate.enter="step-enter"
                  [autoToggle]="false"
                  [expanded]="true"
                  [isStreaming]="false"
                >
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
            }

            <div aiConversationScrollAnchor></div>
          </ai-conversation-content>
        </ai-conversation>
      </div>
    </div>
  `,
  styles: `
    .message-enter-left,
    .message-enter-right,
    .step-enter {
      animation-duration: 260ms;
      animation-fill-mode: both;
      animation-timing-function: ease-out;
    }

    .message-enter-left,
    .step-enter {
      animation-name: message-enter-left;
    }

    .message-enter-right {
      animation-name: message-enter-right;
    }

    .delay-1 {
      animation-delay: 90ms;
    }

    .delay-2 {
      animation-delay: 180ms;
    }

    .delay-3 {
      animation-delay: 260ms;
    }

    .delay-4 {
      animation-delay: 360ms;
    }

    .delay-5 {
      animation-delay: 460ms;
    }

    .delay-6 {
      animation-delay: 560ms;
    }

    .delay-7 {
      animation-delay: 660ms;
    }

    .delay-8 {
      animation-delay: 760ms;
    }

    @keyframes message-enter-left {
      from {
        opacity: 0;
        transform: translateX(-12px);
      }

      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes message-enter-right {
      from {
        opacity: 0;
        transform: translateX(12px);
      }

      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .message-enter-left,
      .message-enter-right,
      .step-enter {
        animation: none;
      }
    }
  `,
})
export class ConversationDemoComponent implements AfterViewInit, OnDestroy {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly timers: ReturnType<typeof globalThis.setTimeout>[] = [];
  private readonly intervals: ReturnType<typeof globalThis.setInterval>[] = [];
  private observer: IntersectionObserver | undefined;
  private timelineStarted = false;

  protected readonly showInitialUser = signal(false);
  protected readonly showIntroAssistant = signal(false);
  protected readonly showIntroReasoning = signal(false);
  protected readonly showDinnerUser = signal(false);
  protected readonly showDinnerAssistant = signal(false);
  protected readonly showDinnerSearch = signal(false);
  protected readonly showTaskUpdate = signal(false);
  protected readonly introAssistantMarkdown = signal('');
  protected readonly dinnerAssistantMarkdown = signal('');
  protected readonly introAssistantStreaming = signal(false);
  protected readonly dinnerAssistantStreaming = signal(false);

  ngAfterViewInit(): void {
    if (typeof IntersectionObserver === 'undefined') {
      this.startTimeline();
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return;
        }

        this.startTimeline();
        this.observer?.disconnect();
      },
      { threshold: 0.35 },
    );

    this.observer.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();

    for (const timer of this.timers) {
      globalThis.clearTimeout(timer);
    }

    for (const interval of this.intervals) {
      globalThis.clearInterval(interval);
    }
  }

  private startTimeline(): void {
    if (this.timelineStarted) {
      return;
    }

    this.timelineStarted = true;
    this.schedule(150, () => this.showInitialUser.set(true));
    this.streamAssistantMessage({
      delay: 850,
      target: this.introAssistantMarkdown,
      text: introAssistantMessage,
      streaming: this.introAssistantStreaming,
      beforeStart: () => this.showIntroAssistant.set(true),
      afterComplete: () => {
        this.schedule(260, () => this.showIntroReasoning.set(true));
        this.schedule(1500, () => this.showDinnerUser.set(true));
        this.schedule(2250, () => {
          this.showDinnerAssistant.set(true);
          this.showDinnerSearch.set(true);
        });
        this.streamAssistantMessage({
          delay: 3000,
          target: this.dinnerAssistantMarkdown,
          text: dinnerAssistantMessage,
          streaming: this.dinnerAssistantStreaming,
          afterComplete: () => this.schedule(520, () => this.showTaskUpdate.set(true)),
        });
      },
    });
  }

  private streamAssistantMessage(options: {
    readonly delay: number;
    readonly target: WritableSignal<string>;
    readonly text: string;
    readonly streaming: WritableSignal<boolean>;
    readonly beforeStart?: () => void;
    readonly afterComplete?: () => void;
  }): void {
    this.schedule(options.delay, () => {
      options.beforeStart?.();
      options.target.set('');
      options.streaming.set(true);

      const characters = Array.from(options.text);
      let nextCharacterCount = 0;
      const interval = globalThis.setInterval(() => {
        nextCharacterCount += 2;
        options.target.set(revealConversationText(options.text, nextCharacterCount));

        if (nextCharacterCount < characters.length) {
          return;
        }

        globalThis.clearInterval(interval);
        options.streaming.set(false);
        options.afterComplete?.();
      }, 28);

      this.intervals.push(interval);
    });
  }

  private schedule(delay: number, callback: () => void): void {
    const timer = globalThis.setTimeout(callback, delay);

    this.timers.push(timer);
  }
}
