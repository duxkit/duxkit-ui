import { Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideCopy } from '@ng-icons/lucide';
import { RouterLink } from '@angular/router';
import { ConversationDemoComponent } from '../conversation-demo.component';
import {
  type AiToolPart,
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
  Tool,
  ToolContent,
  ToolTrigger,
} from 'duxkit-ai';
import { HlmButton } from '@duxkit/ui/helm/button';
import { HlmIcon } from '@duxkit/ui/helm/icon';

@Component({
  imports: [
    ChainOfThought,
    ChainOfThoughtContent,
    ChainOfThoughtSearchResult,
    ChainOfThoughtSearchResults,
    ChainOfThoughtStep,
    ChainOfThoughtTrigger,
    Conversation,
    ConversationDemoComponent,
    ConversationContent,
    ConversationScrollAnchor,
    HlmButton,
    HlmIcon,
    Message,
    MessageContent,
    NgIcon,
    ReasoningContent,
    Task,
    TaskContent,
    TaskItem,
    TaskItemFile,
    TaskTrigger,
    Tool,
    ToolContent,
    ToolTrigger,
    RouterLink,
  ],
  providers: [provideIcons({ lucideCheck, lucideCopy })],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {
  protected readonly installCommand = 'pnpm add duxkit-ai';
  protected readonly databaseToolPart: AiToolPart = {
    type: 'tool-database_query',
    toolCallId: 'call-database-query',
    state: 'input-available',
    input: {
      query: 'select version, summary from releases order by published_at desc limit 3',
    },
  };
  protected readonly databaseToolInput = JSON.stringify(
    {
      query: 'latest releases',
      limit: 3,
    },
    null,
    2,
  );
  protected readonly installCommandCopied = signal(false);
  protected readonly installCopyLabel = computed(() =>
    this.installCommandCopied() ? 'Copied install command' : 'Copy install command',
  );

  protected async copyInstallCommand(): Promise<void> {
    await globalThis.navigator?.clipboard?.writeText(this.installCommand);

    this.installCommandCopied.set(true);
    globalThis.setTimeout(() => this.installCommandCopied.set(false), 1400);
  }
}
