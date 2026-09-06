import {
  afterRenderEffect,
  computed,
  contentChild,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { twMerge } from 'tailwind-merge';
import { Conversation } from './conversation';
import { ConversationScrollAnchor } from './conversation-scroll-anchor';

@Directive({
  exportAs: 'aiConversationContent',
  selector: '[aiConversationContent], ai-conversation-content',
  host: {
    '(scroll)': 'onUserScroll()',
    '[class]': 'classes()',
  },
})
export class ConversationContent {
  autoScroll = true;
  /** Observe conventional message markup automatically. Disable for virtualized renderers. */
  public readonly observeMessages = input(true);
  public readonly atBottom = signal(true);

  readonly anchor = contentChild(ConversationScrollAnchor);
  /** Additional classes merged onto the scrollable conversation content element. */
  readonly userClass = input<string | undefined>(undefined, { alias: 'class' });
  protected readonly classes = computed(() =>
    twMerge('min-h-0 min-w-0 grow overflow-y-auto overscroll-contain', this.userClass()),
  );

  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly conversation = inject(Conversation);
  private readonly stickToBottom = this.conversation.stickToBottom;
  private animationFrame: number | undefined;
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
      if (this.animationFrame !== undefined) cancelAnimationFrame(this.animationFrame);
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
    if (!this.observeMessages()) return;
    const messageElements = Array.from(
      this.elementRef.nativeElement.querySelectorAll<HTMLElement>('[data-ai-message-role]'),
    );
    const didAddMessage = messageElements.length > this.previousMessageElementCount;
    const lastMessageRole = messageElements.at(-1)?.getAttribute('data-ai-message-role');

    this.previousMessageElementCount = messageElements.length;

    if (didAddMessage && lastMessageRole === 'user') {
      this.notifyMessageAdded('user');
      return;
    }

    this.scrollToBottomIfNeeded();
  }

  /** Notify after a custom renderer adds a message. Automatic scrolling respects root policy. */
  public notifyMessageAdded(role?: string): void {
    if (role === 'user' && this.stickToBottom() !== false) this.autoScroll = true;
    this.scrollToBottomIfNeeded();
  }

  private scrollToBottomIfNeeded(): void {
    const stickToBottom = this.stickToBottom();
    const shouldScroll = stickToBottom === true || (stickToBottom === 'auto' && this.autoScroll);

    if (!shouldScroll) {
      return;
    }

    this.scheduleScrollToBottom('smooth', true);
  }

  /** Explicit user action; allowed even when automatic scrolling is disabled. */
  public scrollToBottom(behavior: ScrollBehavior = 'smooth'): void {
    this.autoScroll = true;
    this.scheduleScrollToBottom(behavior);
  }

  private scheduleScrollToBottom(behavior: ScrollBehavior, automatic = false): void {
    if (typeof requestAnimationFrame === 'undefined') {
      return;
    }

    if (this.animationFrame !== undefined) cancelAnimationFrame(this.animationFrame);
    this.animationFrame = requestAnimationFrame(() => {
      this.animationFrame = undefined;
      if (
        automatic &&
        (this.stickToBottom() === false || (this.stickToBottom() === 'auto' && !this.autoScroll))
      )
        return;
      this.scrollContainerToBottom(behavior);
      this.atBottom.set(this.isAtBottom());
    });
  }

  private scrollContainerToBottom(behavior: ScrollBehavior): void {
    const container = this.elementRef.nativeElement;
    const top = container.scrollHeight;

    if (typeof container.scrollTo === 'function') {
      container.scrollTo({ top, behavior });
      return;
    }

    container.scrollTop = top;
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
    this.atBottom.set(this.isAtBottom());
    if (this.stickToBottom() !== 'auto') {
      return;
    }

    this.autoScroll = this.isAtBottom();
  }
}
