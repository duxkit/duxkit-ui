import {
  contentChild,
  computed,
  DestroyRef,
  Directive,
  effect,
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
  private readonly resizeObserver = new ResizeObserver(() => {
    this.scrollToBottomIfNeeded();
  });
  private readonly mutationObserver = new MutationObserver(() => {
    this.scrollToBottomIfNeeded();
  });

  constructor() {
    const element = this.elementRef.nativeElement;

    this.resizeObserver.observe(element);
    this.mutationObserver.observe(element, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    this.destroyRef.onDestroy(() => {
      this.resizeObserver.disconnect();
      this.mutationObserver.disconnect();
    });

    effect(() => {
      this.stickToBottom();
      this.anchor();
      this.scrollToBottomIfNeeded();
    });
  }

  private scrollToBottomIfNeeded(): void {
    const anchor = this.anchor();
    const stickToBottom = this.stickToBottom();
    const shouldScroll =
      stickToBottom === true || (stickToBottom === 'auto' && this.autoScroll);

    if (!shouldScroll || !anchor) {
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
