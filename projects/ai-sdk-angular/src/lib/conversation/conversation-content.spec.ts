import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Conversation } from './conversation';
import { ConversationContent } from './conversation-content';

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

describe('ConversationContent', () => {
  let fixture: ComponentFixture<Host>;
  let originalResizeObserver: typeof ResizeObserver | undefined;
  let originalMutationObserver: typeof MutationObserver;

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
      this.callback([], this as unknown as MutationObserver);
      return [];
    }
  }

  beforeEach(async () => {
    originalResizeObserver = globalThis.ResizeObserver;
    originalMutationObserver = globalThis.MutationObserver;
    globalThis.ResizeObserver = TestResizeObserver as unknown as typeof ResizeObserver;
    globalThis.MutationObserver = TestMutationObserver as unknown as typeof MutationObserver;

    await TestBed.configureTestingModule({
      imports: [Host],
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    if (originalResizeObserver) {
      globalThis.ResizeObserver = originalResizeObserver;
    } else {
      delete (globalThis as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver;
    }

    globalThis.MutationObserver = originalMutationObserver;
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
});
