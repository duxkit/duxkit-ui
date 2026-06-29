import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  WritableSignal,
  computed,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  type AiAttachmentPart,
  type AiToolPart,
  Attachment,
  AttachmentPreview,
  Attachments,
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
  ChainOfThoughtTrigger,
  Checkpoint,
  CheckpointIcon,
  CheckpointTrigger,
  Confirmation,
  ConfirmationAccepted,
  ConfirmationAction,
  ConfirmationActions,
  ConfirmationRequest,
  ConfirmationTitle,
  Conversation,
  ConversationContent,
  ConversationScrollAnchor,
  Message,
  MessageContent,
  ReasoningContent,
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
} from 'duxkit-ai';
import type { LanguageModelUsage } from 'ai';
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
const travelNotesUserPrompt =
  'That works. Can you add the hotel area and dinner picks to my travel notes?';
const finalAssistantMessage =
  'Done — I added the neighborhood shortlist, hotel notes, and dinner picks to your travel notes so the plan is ready to refine.';
const dinnerSearchSources = ['Taberna Rua das Flores', 'Prado', 'O Velho Eurico'] as const;
const tripAttachments: readonly AiAttachmentPart[] = [
  {
    type: 'file',
    mediaType: 'application/pdf',
    filename: 'lisbon-preferences.pdf',
    url: 'https://example.com/lisbon-preferences.pdf',
  },
  {
    type: 'source-document',
    sourceId: 'past-quiet-trips',
    mediaType: 'text/markdown',
    title: 'Past quiet trip notes',
    filename: 'past-quiet-trips.md',
  },
];
const planningUsage: LanguageModelUsage = {
  inputTokens: 18_420,
  inputTokenDetails: {
    cacheReadTokens: 3_240,
    cacheWriteTokens: 0,
    noCacheTokens: 15_180,
  },
  outputTokens: 2_880,
  outputTokenDetails: {
    reasoningTokens: 760,
    textTokens: 2_120,
  },
  totalTokens: 21_300,
};
const hotelResearchToolPart: AiToolPart = {
  type: 'tool-searchStays',
  toolCallId: 'call-stays-1',
  state: 'output-available',
  input: {
    city: 'Lisbon',
    preferences: ['quiet area', 'walkable dinner', 'refundable hotel'],
  },
  output: {
    neighborhoods: ['Principe Real', 'Estrela', 'Lapa'],
    filters: ['4-star or boutique', 'late cancellation', 'under 15 minute dinner walk'],
  },
};
const travelSourceLinks = [
  {
    href: 'https://www.visitlisboa.com/',
    title: 'Visit Lisboa',
  },
  {
    href: 'https://www.timeout.com/lisbon',
    title: 'Time Out Lisbon',
  },
  {
    href: 'https://www.cntraveller.com/lisbon',
    title: 'Condé Nast Traveller Lisbon',
  },
] as const;
const notesSaveRequestedPart: AiToolPart = {
  type: 'tool-updateTravelNotes',
  toolCallId: 'call-notes-1',
  state: 'approval-requested',
  input: {
    file: 'lisbon_2026.docx',
    sections: ['hotel areas', 'dinner shortlist'],
  },
  approval: {
    id: 'approval-notes-1',
  },
};
const notesSaveApprovedPart: AiToolPart = {
  ...notesSaveRequestedPart,
  state: 'approval-responded',
  approval: {
    id: 'approval-notes-1',
    approved: true,
    reason: 'Approved in the live demo.',
  },
};
@Component({
  imports: [
    ChainOfThought,
    ChainOfThoughtContent,
    ChainOfThoughtSearchResult,
    ChainOfThoughtSearchResults,
    ChainOfThoughtStep,
    ChainOfThoughtTrigger,
    Attachment,
    AttachmentPreview,
    Attachments,
    Checkpoint,
    CheckpointIcon,
    CheckpointTrigger,
    Confirmation,
    ConfirmationAccepted,
    ConfirmationAction,
    ConfirmationActions,
    ConfirmationRequest,
    ConfirmationTitle,
    Conversation,
    ConversationContent,
    ConversationScrollAnchor,
    Message,
    MessageContent,
    ReasoningContent,
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
  selector: 'app-conversation-demo',
  template: `
    <div class="conversation-perspective" aria-label="Conversation demo preview">
      <div class="conversation-plane h-[20em] rounded-xl">
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
                <ai-attachments class="mt-3" variant="inline">
                  @for (attachment of tripAttachmentParts; track attachmentTrackId(attachment)) {
                    <ai-attachment [data]="attachment">
                      <ai-attachment-preview />
                    </ai-attachment>
                  }
                </ai-attachments>
              </ai-message>
            }

            @if (showIntroAssistant()) {
              <ai-message from="assistant" animate.enter="message-enter-left">
                <ai-message-content [markdown]="introAssistantMarkdown()" />
              </ai-message>
            }

            @if (showIntroPlanAssistant()) {
              <ai-message from="assistant" animate.enter="message-enter-left">
                @if (showIntroReasoning()) {
                  <ai-chain-of-thought [isStreaming]="introReasoningStreaming()">
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
                  <ai-chain-of-thought [isStreaming]="dinnerSearchStep() === 'active'">
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

                @if (showHotelResearchTool()) {
                  <ai-tool [part]="hotelResearchPart">
                    <button aiToolTrigger></button>
                    <ai-tool-content />
                  </ai-tool>
                }

                @if (dinnerAssistantMarkdown()) {
                  <ai-message-content [markdown]="dinnerAssistantMarkdown()" />
                }

                @if (showTravelSources()) {
                  <ai-sources [expanded]="true">
                    <button aiSourcesTrigger [count]="travelSources.length"></button>
                    <ai-sources-content>
                      @for (source of travelSources; track source.href) {
                        <a aiSource [href]="source.href" [title]="source.title"></a>
                      }
                    </ai-sources-content>
                  </ai-sources>
                }
              </ai-message>
            }

            @if (showTravelNotesUser()) {
              <ai-message from="user" animate.enter="message-enter-right">
                <ai-message-content [markdown]="travelNotesUserMessage" />
              </ai-message>
            }

            @if (
              showNotesApproval() ||
              showCheckpoint() ||
              showTaskUpdate() ||
              finalAssistantMarkdown()
            ) {
              <ai-message from="assistant" animate.enter="message-enter-left">
                @if (showNotesApproval()) {
                  <ai-tool [part]="notesSavePart()">
                    <button aiToolTrigger></button>
                    <ai-tool-content />
                    <ai-confirmation [part]="notesSavePart()">
                      <ai-confirmation-request>
                        <ai-confirmation-title />
                        <p class="my-2 text-muted-foreground">
                          Allow the assistant to update the travel notes document?
                        </p>
                        <ai-confirmation-actions>
                          <button aiConfirmationAction class="confirmation-action-secondary">
                            Deny
                          </button>
                          <button aiConfirmationAction class="confirmation-action-primary">
                            Allow
                          </button>
                        </ai-confirmation-actions>
                      </ai-confirmation-request>
                      <ai-confirmation-accepted>
                        <ai-confirmation-title />
                      </ai-confirmation-accepted>
                    </ai-confirmation>
                  </ai-tool>
                }

                @if (showCheckpoint()) {
                  <ai-checkpoint class="my-3">
                    <ai-checkpoint-icon />
                    <button aiCheckpointTrigger ariaLabel="Restore before travel notes update">
                      Checkpoint
                    </button>
                  </ai-checkpoint>
                }

                @if (showTaskUpdate()) {
                  <ai-task [isStreaming]="taskUpdateStreaming()">
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
                }

                @if (finalAssistantMarkdown()) {
                  <ai-message-content
                    class="task-follow-up-message"
                    [markdown]="finalAssistantMarkdown()"
                  />
                }
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

    .task-follow-up-message {
      display: block;
    }

    .confirmation-action-primary,
    .confirmation-action-secondary {
      border-radius: 0.375rem;
      border: 1px solid var(--border);
      cursor: default;
      font-size: 12px;
      font-weight: 500;
      line-height: 1;
      padding: 0.5rem 0.75rem;
    }

    .confirmation-action-primary {
      background: var(--primary);
      color: var(--primary-foreground);
    }

    .confirmation-action-secondary {
      background: transparent;
      color: var(--muted-foreground);
    }
  `,
})
export class ConversationDemoComponent implements AfterViewInit, OnDestroy {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly timers: ReturnType<typeof globalThis.setTimeout>[] = [];
  private readonly intervals: ReturnType<typeof globalThis.setInterval>[] = [];
  private observer: IntersectionObserver | undefined;
  private timelineStarted = false;

  protected readonly showInitialUser = signal(false);
  protected readonly showIntroAssistant = signal(false);
  protected readonly showIntroPlanAssistant = signal(false);
  protected readonly showIntroReasoning = signal(false);
  protected readonly showDinnerUser = signal(false);
  protected readonly showDinnerAssistant = signal(false);
  protected readonly showDinnerSearch = signal(false);
  protected readonly showHotelResearchTool = signal(false);
  protected readonly showTravelSources = signal(false);
  protected readonly showTravelNotesUser = signal(false);
  protected readonly showNotesApproval = signal(false);
  protected readonly showCheckpoint = signal(false);
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
  protected readonly notesSavePart = signal<AiToolPart>(notesSaveRequestedPart);
  protected readonly tripAttachmentParts = tripAttachments;
  protected readonly planningContextUsage = planningUsage;
  protected readonly hotelResearchPart = hotelResearchToolPart;
  protected readonly travelSources = travelSourceLinks;
  protected readonly travelNotesUserMessage = travelNotesUserPrompt;
  protected readonly introReasoningStreaming = computed(() =>
    reasoningSequenceStreaming(this.showIntroReasoning(), this.introNeighborhoodStep()),
  );
  protected readonly visibleDinnerSearchSources = computed(() =>
    visibleSearchSources(dinnerSearchSources, this.dinnerSearchSourceCount()),
  );

  ngAfterViewInit(): void {
    if (!this.isBrowser) {
      return;
    }

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
          this.showIntroPlanAssistant.set(true);
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
            this.schedule(4400, () => this.showHotelResearchTool.set(true));
            this.streamAssistantMessage({
              delay: 5120,
              target: this.dinnerAssistantMarkdown,
              text: dinnerAssistantMessage,
              streaming: this.dinnerAssistantStreaming,
              afterComplete: () => {
                this.schedule(220, () => this.showTravelSources.set(true));
                this.schedule(820, () => this.showTravelNotesUser.set(true));
                this.schedule(1480, () => this.showNotesApproval.set(true));
                this.schedule(2620, () => this.notesSavePart.set(notesSaveApprovedPart));
                this.schedule(3180, () => this.showCheckpoint.set(true));
                this.schedule(3720, () => {
                  this.showTaskUpdate.set(true);
                  this.taskUpdateStreaming.set(true);
                });
                this.schedule(5000, () => this.taskUpdateStreaming.set(false));
                this.streamAssistantMessage({
                  delay: 5400,
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

  protected attachmentTrackId(attachment: AiAttachmentPart): string {
    if (attachment.type === 'source-document') {
      return attachment.sourceId;
    }

    return attachment.filename ?? attachment.url ?? attachment.mediaType;
  }

  private schedule(delay: number, callback: () => void): void {
    const timer = globalThis.setTimeout(callback, delay);

    this.timers.push(timer);
  }
}
