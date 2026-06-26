import {
  afterRenderEffect,
  contentChild,
  computed,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import { twMerge } from 'tailwind-merge';
import { ConversationScrollAnchor } from './conversation-scroll-anchor';
import { Conversation } from './conversation';

@Directive({
  selector: '[aiConversationContent], ai-conversation-content',
  host: {
    '(wheel)': 'onUserScroll()',
    '(touchmove)': 'onUserScroll()',
    '(keydown)': 'onUserScroll()',
    '[class]': 'classes()',
  },
})
export class ConversationContent {
  autoScroll = true;

  readonly anchor = contentChild(ConversationScrollAnchor);
  readonly userClass = input<string | undefined>(undefined, { alias: 'class' });
  protected readonly classes = computed(() =>
    twMerge('min-h-0 min-w-0 grow overflow-y-auto overscroll-contain', this.userClass()),
  );

  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly conversation = inject(Conversation);
  private readonly stickToBottom = this.conversation.stickToBottom;
  private previousMessageElementCount = 0;
  private readonly resizeObserver =
    typeof ResizeObserver === 'undefined'
      ? undefined
      : new ResizeObserver(() => {
          this.scrollToBottomIfNeeded();
        });
  private readonly mutationObserver =
    typeof MutationObserver === 'undefined'
      ? undefined
      : new MutationObserver(() => {
          this.onContentMutated();
        });

  constructor() {
    const element = this.elementRef.nativeElement;

    this.resizeObserver?.observe(element);
    this.mutationObserver?.observe(element, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    this.destroyRef.onDestroy(() => {
      this.resizeObserver?.disconnect();
      this.mutationObserver?.disconnect();
    });

    afterRenderEffect(() => {
      this.stickToBottom();
      this.anchor();
      this.scrollToBottomIfNeeded();
    });
  }

  private onContentMutated(): void {
    const messageElements = Array.from(
      this.elementRef.nativeElement.querySelectorAll<HTMLElement>('[data-ai-message-role]'),
    );
    const didAddMessage = messageElements.length > this.previousMessageElementCount;
    const lastMessageRole = messageElements.at(-1)?.getAttribute('data-ai-message-role');

    this.previousMessageElementCount = messageElements.length;

    if (didAddMessage && lastMessageRole === 'user') {
      this.autoScroll = true;
      this.scrollToBottom();
      return;
    }

    this.scrollToBottomIfNeeded();
  }

  private scrollToBottomIfNeeded(): void {
    const anchor = this.anchor();
    const stickToBottom = this.stickToBottom();
    const shouldScroll = stickToBottom === true || (stickToBottom === 'auto' && this.autoScroll);

    if (!shouldScroll || !anchor) {
      return;
    }

    requestAnimationFrame(() => {
      anchor.scrollIntoView({ behavior: 'smooth' });
    });
  }

  private scrollToBottom(): void {
    const anchor = this.anchor();

    if (!anchor) {
      return;
    }

    requestAnimationFrame(() => {
      anchor.scrollIntoView({ behavior: 'smooth' });
    });
  }

  isAtBottom(): boolean {
    const container = this.elementRef.nativeElement;
    const clientHeight = container.clientHeight;
    const scrollHeight = container.scrollHeight;
    const scrollTop = container.scrollTop;

    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    return distanceFromBottom <= 20;
  }

  onUserScroll(): void {
    if (this.stickToBottom() !== 'auto') {
      return;
    }

    this.autoScroll = this.isAtBottom();
  }
}
