import { Component, computed, signal, type OnDestroy, type WritableSignal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideCopy } from '@ng-icons/lucide';
import { RouterOutlet } from '@angular/router';
import {
  type AiToolPart,
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtImage,
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
  ChainOfThoughtTrigger,
  Confirmation,
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
  Task,
  TaskContent,
  TaskItem,
  TaskItemFile,
  TaskTrigger,
  Tool,
  ToolContent,
  ToolTrigger,
} from 'duxkit-ai';
import { HlmButton } from '@duxkit/ui/helm/button';
import { HlmIcon } from '@duxkit/ui/helm/icon';
import { HeaderComponent } from './header.component';

interface DemoQueueStep {
  readonly wait: number;
  readonly duration?: number;
  readonly run: () => void;
}

@Component({
  imports: [
    ChainOfThought,
    ChainOfThoughtContent,
    ChainOfThoughtImage,
    ChainOfThoughtSearchResult,
    ChainOfThoughtSearchResults,
    ChainOfThoughtStep,
    ChainOfThoughtTrigger,
    Confirmation,
    ConfirmationAction,
    ConfirmationActions,
    ConfirmationRequest,
    ConfirmationTitle,
    Conversation,
    ConversationContent,
    ConversationScrollAnchor,
    HlmButton,
    HlmIcon,
    HeaderComponent,
    Message,
    MessageContent,
    NgIcon,
    ReasoningContent,
    RouterOutlet,
    Task,
    TaskContent,
    TaskItem,
    TaskItemFile,
    TaskTrigger,
    Tool,
    ToolContent,
    ToolTrigger,
  ],
  providers: [provideIcons({ lucideCheck, lucideCopy })],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnDestroy {
  protected readonly installCommand = 'pnpm add duxkit-ai';
  protected readonly assistantResponse =
    'Absolutely. I’ll compare quieter areas, keep food local, and ask before holding anything.';
  protected readonly reasoningResponse =
    'The user wants a relaxed Lisbon weekend with good food and fewer tourist traps. Prioritize Principe Real, Estrela, and Lapa. Look for walkable restaurants, a calm hotel, and refundable availability. Do not place a hold without asking first.';
  protected readonly finalAssistantResponse =
    'I found a refundable room in Principe Real. I’ll only place the hold if you approve.';
  protected readonly dinnerAssistantResponse =
    'I found a nearby option that fits: a small Portuguese restaurant about 8 minutes away, with petiscos, grilled fish, and a quieter late seating.';
  protected readonly foodAssistantResponse =
    'Order petiscos to share, then finish with pastel de nata if they have it warm: crisp pastry, custard, and a caramelized top.';
  protected readonly notesAssistantResponse =
    'Done. I added the hotel area, dinner shortlist, and order ideas to your Lisbon notes.';
  protected readonly installCommandCopied = signal(false);
  protected readonly installCopyLabel = computed(() =>
    this.installCommandCopied() ? 'Copied install command' : 'Copy install command',
  );
  protected readonly demoStage = signal(0);
  protected readonly assistantText = signal('');
  protected readonly reasoningText = signal('');
  protected readonly finalAssistantText = signal('');
  protected readonly dinnerAssistantText = signal('');
  protected readonly foodAssistantText = signal('');
  protected readonly notesAssistantText = signal('');

  private readonly timers: number[] = [];

  protected readonly planStepStatus = computed(() =>
    this.demoStage() < 5 ? 'active' : 'complete',
  );

  protected readonly approvalStepStatus = computed(() =>
    this.demoStage() < 6 ? 'pending' : this.demoStage() < 7 ? 'active' : 'complete',
  );
  protected readonly dinnerSearchStepStatus = computed(() =>
    this.demoStage() < 13 ? 'active' : 'complete',
  );
  protected readonly dinnerFilterStepStatus = computed(() =>
    this.demoStage() < 13 ? 'pending' : this.demoStage() < 14 ? 'active' : 'complete',
  );
  protected readonly foodImageStepStatus = computed(() =>
    this.demoStage() < 17 ? 'active' : 'complete',
  );

  protected readonly approvalToolPart = computed<AiToolPart>(() => {
    if (this.demoStage() >= 7) {
      return {
        type: 'tool-holdHotel',
        toolCallId: 'call-hotel-hold',
        state: 'output-available',
        input: {
          hotel: 'Casa do Jardim',
          neighborhood: 'Principe Real',
          dates: 'Friday to Sunday',
          cancellation: 'Free cancellation until 24 hours before check-in',
        },
        output: {
          holdPlaced: true,
        },
        approval: {
          id: 'approval-hotel-hold',
          approved: true,
        },
      };
    }

    return {
      type: 'tool-holdHotel',
      toolCallId: 'call-hotel-hold',
      state: 'approval-requested',
      input: {
        hotel: 'Casa do Jardim',
        neighborhood: 'Principe Real',
        dates: 'Friday to Sunday',
        cancellation: 'Free cancellation until 24 hours before check-in',
      },
      approval: {
        id: 'approval-hotel-hold',
      },
    };
  });

  constructor() {
    this.runDemo();
  }

  ngOnDestroy(): void {
    for (const timer of this.timers) {
      globalThis.clearTimeout(timer);
    }
  }

  protected async copyInstallCommand(): Promise<void> {
    await globalThis.navigator?.clipboard?.writeText(this.installCommand);

    this.installCommandCopied.set(true);
    globalThis.setTimeout(() => this.installCommandCopied.set(false), 1400);
  }

  private runDemo(): void {
    this.runDemoQueue([
      this.step(1000, () => this.demoStage.set(1)),
      this.streamStep(600, this.assistantText, this.assistantResponse, 5),
      this.step(300, () => this.demoStage.set(2)),
      this.step(900, () => this.demoStage.set(3)),
      this.streamStep(1000, this.reasoningText, this.reasoningResponse, 14),
      this.step(800, () => this.demoStage.set(4)),
      this.step(1200, () => this.demoStage.set(5)),
      this.step(1400, () => this.demoStage.set(6)),
      this.step(1600, () => this.demoStage.set(7)),
      this.streamStep(600, this.finalAssistantText, this.finalAssistantResponse, 5),
      this.step(1000, () => this.demoStage.set(8)),
      this.step(900, () => this.demoStage.set(9)),
      this.step(800, () => this.demoStage.set(10)),
      this.step(200, () => this.demoStage.set(11)),
      this.step(200, () => this.demoStage.set(12)),
      this.step(300, () => this.demoStage.set(13)),
      this.step(1200, () => this.demoStage.set(14)),
      this.streamStep(400, this.dinnerAssistantText, this.dinnerAssistantResponse, 7),
      this.step(1000, () => this.demoStage.set(15)),
      this.step(900, () => this.demoStage.set(16)),
      this.step(1600, () => this.demoStage.set(17)),
      this.streamStep(400, this.foodAssistantText, this.foodAssistantResponse, 7),
      this.step(700, () => this.demoStage.set(18)),
      this.step(1000, () => this.demoStage.set(19)),
      this.step(800, () => this.demoStage.set(20)),
      this.step(700, () => this.demoStage.set(21)),
      this.step(700, () => this.demoStage.set(22)),
      this.step(700, () => this.demoStage.set(23)),
      this.streamStep(400, this.notesAssistantText, this.notesAssistantResponse, 7),
      this.step(600, () => this.demoStage.set(24)),
    ]);
  }

  private runDemoQueue(steps: readonly DemoQueueStep[]): void {
    let elapsed = 0;

    for (const step of steps) {
      elapsed += step.wait;
      this.schedule(elapsed, step.run);
      elapsed += step.duration ?? 0;
    }
  }

  private step(wait: number, run: () => void): DemoQueueStep {
    return { wait, run };
  }

  private streamStep(
    wait: number,
    target: WritableSignal<string>,
    text: string,
    interval: number,
  ): DemoQueueStep {
    return {
      wait,
      duration: this.streamDuration(text, interval),
      run: () => this.streamInto(target, text, interval),
    };
  }

  private schedule(delay: number, callback: () => void): void {
    this.timers.push(globalThis.setTimeout(callback, delay));
  }

  private streamInto(target: WritableSignal<string>, text: string, interval: number): void {
    target.set('');

    for (let index = 0; index <= text.length; index += 1) {
      this.schedule(index * interval, () => target.set(text.slice(0, index)));
    }
  }

  private streamDuration(text: string, interval: number): number {
    return text.length * interval;
  }
}
