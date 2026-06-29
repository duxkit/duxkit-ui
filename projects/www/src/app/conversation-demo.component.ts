import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  WritableSignal,
  computed,
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
import {
  type DemoReasoningStepState,
  revealConversationText,
  reasoningSequenceStreaming,
  reasoningStepStatus,
  visibleSearchSources,
} from './conversation-demo-timeline';

const introAssistantMessage =
  'Absolutely. I’ll compare quieter areas, keep food local, and ask before holding anything.';
const introPlanMessage =
  'I’d start with Príncipe Real or Estrela: both stay calm, have strong restaurants nearby, and make it easy to pick a comfortable hotel without being in the busiest tourist streets.';
const dinnerAssistantMessage =
  'I found a nearby option that fits: a small Portuguese restaurant about 8 minutes away, with petiscos, grilled fish, and a quieter late seating.';
const travelNotesUserPrompt = 'That works. Can you add the hotel area and dinner picks to my travel notes?';
const finalAssistantMessage =
  'Done — I added the neighborhood shortlist, hotel notes, and dinner picks to your travel notes so the plan is ready to refine.';
const dinnerSearchSources = ['Taberna Rua das Flores', 'Prado', 'O Velho Eurico'] as const;

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
                    [isStreaming]="introReasoningStreaming()"
                  >
                    <button aiChainOfThoughtTrigger></button>
                    <ai-chain-of-thought-content>
                      @if (introTripStep() !== 'hidden') {
                        <ai-chain-of-thought-step
                          [status]="stepStatus(introTripStep())"
                          [icon]="stepIcon(introTripStep(), 'lucideCircleCheck')"
                          label="Understand the trip"
                          description="Quiet Lisbon weekend, good food, nice hotel, fewer tourist traps."
                        />
                      }

                      @if (introNeighborhoodStep() !== 'hidden') {
                        <ai-chain-of-thought-step
                          [status]="stepStatus(introNeighborhoodStep())"
                          [icon]="stepIcon(introNeighborhoodStep(), 'lucideCircleCheck')"
                          label="Compare neighborhoods"
                          description="Favor calm areas with restaurants and refundable stays."
                        >
                          <ai-reasoning-content
                            class="agent-reasoning-note"
                            markdown="Prioritize Principe Real, Estrela, and Lapa. Look for walkable restaurants, a calm hotel, and refundable availability."
                          />
                        </ai-chain-of-thought-step>
                      }
                    </ai-chain-of-thought-content>
                  </ai-chain-of-thought>
                }

                @if (introPlanMarkdown()) {
                  <ai-message-content [markdown]="introPlanMarkdown()" />
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
                    [isStreaming]="dinnerSearchStep() === 'active'"
                  >
                    <button aiChainOfThoughtTrigger></button>
                    <ai-chain-of-thought-content>
                      <ai-chain-of-thought-step
                        [status]="stepStatus(dinnerSearchStep())"
                        [icon]="stepIcon(dinnerSearchStep(), 'lucideGlobe')"
                        label="Search nearby dinner spots"
                        description="Find relaxed restaurants near Principe Real."
                      >
                        <ai-chain-of-thought-search-results>
                          @if (visibleDinnerSearchSources().length === 0) {
                            <span class="search-source-loading text-muted-foreground">
                              Loading sources...
                            </span>
                          }

                          @for (source of visibleDinnerSearchSources(); track source) {
                            <span aiChainOfThoughtSearchResult>{{ source }}</span>
                          }
                        </ai-chain-of-thought-search-results>
                      </ai-chain-of-thought-step>
                    </ai-chain-of-thought-content>
                  </ai-chain-of-thought>
                }

                @if (dinnerAssistantMarkdown()) {
                  <ai-message-content
                    [markdown]="dinnerAssistantMarkdown()"
                  />
                }
              </ai-message>
            }

            @if (showTravelNotesUser()) {
              <ai-message from="user" animate.enter="message-enter-right">
                <ai-message-content [markdown]="travelNotesUserMessage" />
              </ai-message>
            }

            @if (showTaskUpdate()) {
              <ai-message from="assistant" animate.enter="message-enter-left">
                <ai-task
                  [isStreaming]="taskUpdateStreaming()"
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

            @if (finalAssistantMarkdown()) {
              <ai-message from="assistant" animate.enter="message-enter-left">
                <ai-message-content [markdown]="finalAssistantMarkdown()" />
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
    .message-enter-right {
      animation-duration: 260ms;
      animation-fill-mode: both;
      animation-timing-function: ease-out;
    }

    .message-enter-left {
      animation-name: message-enter-left;
    }

    .message-enter-right {
      animation-name: message-enter-right;
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
      .message-enter-right {
        animation: none;
      }
    }

    :host ::ng-deep .agent-reasoning-note .ai-markdown-reasoning {
      font-size: 13px;
      line-height: 1.45;
    }

    .search-source-loading {
      display: inline-flex;
      align-items: center;
      min-height: 22px;
      font-size: 12px;
      line-height: 1;
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
  protected readonly showTravelNotesUser = signal(false);
  protected readonly showTaskUpdate = signal(false);
  protected readonly introAssistantMarkdown = signal('');
  protected readonly introPlanMarkdown = signal('');
  protected readonly dinnerAssistantMarkdown = signal('');
  protected readonly finalAssistantMarkdown = signal('');
  protected readonly introAssistantStreaming = signal(false);
  protected readonly introPlanStreaming = signal(false);
  protected readonly dinnerAssistantStreaming = signal(false);
  protected readonly finalAssistantStreaming = signal(false);
  protected readonly taskUpdateStreaming = signal(false);
  protected readonly dinnerSearchSourceCount = signal(0);
  protected readonly introTripStep = signal<DemoReasoningStepState>('hidden');
  protected readonly introNeighborhoodStep = signal<DemoReasoningStepState>('hidden');
  protected readonly dinnerSearchStep = signal<DemoReasoningStepState>('hidden');
  protected readonly travelNotesUserMessage = travelNotesUserPrompt;
  protected readonly introReasoningStreaming = computed(() =>
    reasoningSequenceStreaming(this.showIntroReasoning(), this.introNeighborhoodStep()),
  );
  protected readonly visibleDinnerSearchSources = computed(() =>
    visibleSearchSources(dinnerSearchSources, this.dinnerSearchSourceCount()),
  );

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
        this.schedule(260, () => {
          this.showIntroReasoning.set(true);
          this.introTripStep.set('active');
        });
        this.schedule(1450, () => this.introTripStep.set('complete'));
        this.schedule(1700, () => this.introNeighborhoodStep.set('active'));
        this.schedule(3200, () => this.introNeighborhoodStep.set('complete'));
        this.streamAssistantMessage({
          delay: 3650,
          target: this.introPlanMarkdown,
          text: introPlanMessage,
          streaming: this.introPlanStreaming,
          afterComplete: () => {
            this.schedule(720, () => this.showDinnerUser.set(true));
            this.schedule(1460, () => {
              this.showDinnerAssistant.set(true);
              this.showDinnerSearch.set(true);
              this.dinnerSearchStep.set('active');
            });
            this.schedule(2180, () => this.dinnerSearchSourceCount.set(1));
            this.schedule(2860, () => this.dinnerSearchSourceCount.set(2));
            this.schedule(3540, () => this.dinnerSearchSourceCount.set(3));
            this.schedule(4260, () => this.dinnerSearchStep.set('complete'));
            this.streamAssistantMessage({
              delay: 4620,
              target: this.dinnerAssistantMarkdown,
              text: dinnerAssistantMessage,
              streaming: this.dinnerAssistantStreaming,
              afterComplete: () => {
                this.schedule(520, () => this.showTravelNotesUser.set(true));
                this.schedule(1280, () => {
                  this.showTaskUpdate.set(true);
                  this.taskUpdateStreaming.set(true);
                });
                this.schedule(2560, () => this.taskUpdateStreaming.set(false));
                this.streamAssistantMessage({
                  delay: 2960,
                  target: this.finalAssistantMarkdown,
                  text: finalAssistantMessage,
                  streaming: this.finalAssistantStreaming,
                });
              },
            });
          },
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

  protected stepStatus(state: DemoReasoningStepState): 'active' | 'complete' | 'pending' {
    return reasoningStepStatus(state);
  }

  protected stepIcon(state: DemoReasoningStepState, completeIcon: string): string {
    return state === 'active' ? 'lucideLoaderCircle' : completeIcon;
  }

  private schedule(delay: number, callback: () => void): void {
    const timer = globalThis.setTimeout(callback, delay);

    this.timers.push(timer);
  }
}
