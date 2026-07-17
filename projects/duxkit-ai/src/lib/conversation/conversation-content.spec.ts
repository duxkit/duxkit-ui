import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Conversation } from './conversation';
import { ConversationContent } from './conversation-content';
import { ConversationScrollAnchor } from './conversation-scroll-anchor';

@Component({
  imports: [Conversation, ConversationContent],
  template: `
    <ai-conversation>
      <ai-conversation-content class="overflow-visible grow-0 custom-content" />
    </ai-conversation>
  `,
})
class Host {
  readonly content = viewChild.required(ConversationContent);
}

@Component({
  imports: [Conversation, ConversationContent, ConversationScrollAnchor],
  template: `
    <ai-conversation>
      <ai-conversation-content>
        <div aiConversationScrollAnchor></div>
      </ai-conversation-content>
    </ai-conversation>
  `,
})
class MessagesHost {
  readonly content = viewChild.required(ConversationContent);
}

describe('ConversationContent', () => {
  let fixture: ComponentFixture<Host>;
  let originalScrollIntoView: typeof HTMLElement.prototype.scrollIntoView | undefined;
  let originalScrollTo: typeof HTMLElement.prototype.scrollTo | undefined;
  let mutationObservers: TestMutationObserver[];

  class TestResizeObserver {
    observe(): void {}
    disconnect(): void {}
    unobserve(): void {}
  }

  class TestMutationObserver {
    constructor(private readonly callback: MutationCallback) {}
    observe(): void {}
    disconnect(): void {}
    takeRecords(): MutationRecord[] {
      this.trigger();
      return [];
    }
    trigger(): void {
      this.callback([], this as unknown as MutationObserver);
    }
  }

  beforeEach(async () => {
    originalScrollIntoView = HTMLElement.prototype.scrollIntoView;
    originalScrollTo = HTMLElement.prototype.scrollTo;
    mutationObservers = [];
    vi.stubGlobal('ResizeObserver', TestResizeObserver);
    vi.stubGlobal(
      'MutationObserver',
      class extends TestMutationObserver {
        constructor(callback: MutationCallback) {
          super(callback);
          mutationObservers.push(this);
        }
      },
    );
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });

    await TestBed.configureTestingModule({
      imports: [Host],
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.unstubAllGlobals();

    if (originalScrollIntoView) {
      HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
    } else {
      delete (
        HTMLElement.prototype as { scrollIntoView?: typeof HTMLElement.prototype.scrollIntoView }
      ).scrollIntoView;
    }

    if (originalScrollTo) {
      HTMLElement.prototype.scrollTo = originalScrollTo;
    } else {
      delete (HTMLElement.prototype as { scrollTo?: typeof HTMLElement.prototype.scrollTo })
        .scrollTo;
    }
  });

  it('matches element usage', () => {
    expect(fixture.componentInstance.content()).toBeTruthy();
  });

  it('lets consumer classes override conflicting default scroll classes', () => {
    const element = fixture.nativeElement.querySelector('ai-conversation-content') as HTMLElement;

    expect(element.classList).toContain('min-h-0');
    expect(element.classList).toContain('min-w-0');
    expect(element.classList).toContain('overscroll-contain');
    expect(element.classList).toContain('overflow-visible');
    expect(element.classList).toContain('grow-0');
    expect(element.classList).toContain('custom-content');
    expect(element.classList).not.toContain('overflow-y-auto');
    expect(element.classList).not.toContain('grow');
  });

  it('stops autoscrolling after the user scrolls away from the bottom', () => {
    const element = fixture.nativeElement.querySelector('ai-conversation-content') as HTMLElement;

    Object.defineProperties(element, {
      clientHeight: { configurable: true, value: 200 },
      scrollHeight: { configurable: true, value: 1_000 },
      scrollTop: { configurable: true, value: 200 },
    });

    element.dispatchEvent(new Event('scroll'));

    expect(fixture.componentInstance.content().autoScroll).toBe(false);
  });

  it('forces container scroll when a user message is added after the user intentionally scrolled up', async () => {
    const scrollIntoView = vi.fn();
    const scrollTo = vi.fn();
    HTMLElement.prototype.scrollIntoView = scrollIntoView;
    HTMLElement.prototype.scrollTo = scrollTo;

    await TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [MessagesHost],
      })
      .compileComponents();

    const messagesFixture = TestBed.createComponent(MessagesHost);
    messagesFixture.detectChanges();
    await messagesFixture.whenStable();

    const content = messagesFixture.nativeElement.querySelector(
      'ai-conversation-content',
    ) as HTMLElement;

    scrollIntoView.mockClear();
    messagesFixture.componentInstance.content().autoScroll = false;
    appendMessage(messagesFixture, 'assistant');
    mutationObservers.forEach((observer) => observer.trigger());
    await messagesFixture.whenStable();

    expect(scrollIntoView).not.toHaveBeenCalled();
    scrollTo.mockClear();

    appendMessage(messagesFixture, 'user');
    mutationObservers.forEach((observer) => observer.trigger());
    await messagesFixture.whenStable();

    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(scrollTo).toHaveBeenCalledWith({ top: content.scrollHeight, behavior: 'smooth' });
    expect(messagesFixture.componentInstance.content().autoScroll).toBe(true);
  });

  it('skips autoscroll scheduling when requestAnimationFrame is unavailable', async () => {
    vi.stubGlobal('requestAnimationFrame', undefined);

    await TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [MessagesHost],
      })
      .compileComponents();

    const messagesFixture = TestBed.createComponent(MessagesHost);

    expect(() => messagesFixture.detectChanges()).not.toThrow();

    appendMessage(messagesFixture, 'user');
    expect(() => mutationObservers.forEach((observer) => observer.trigger())).not.toThrow();
  });
});

function appendMessage(fixture: ComponentFixture<MessagesHost>, role: 'assistant' | 'user'): void {
  const content = fixture.nativeElement.querySelector('ai-conversation-content') as HTMLElement;
  const message = document.createElement('div');

  message.setAttribute('data-ai-message-role', role);
  content.append(message);
}
