import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Message } from './message';
import {
  MessageActions,
  MessageActionsCopy,
  MessageActionsThumbsDown,
  MessageActionsThumbsUp,
} from './message-actions';
import { MessageContent } from './message-content';

@Component({
  imports: [
    Message,
    MessageActions,
    MessageActionsCopy,
    MessageActionsThumbsDown,
    MessageActionsThumbsUp,
    MessageContent,
  ],
  template: `
    <ai-message from="assistant">
      <ai-message-content [markdown]="firstText()" />
      <ai-message-content [markdown]="secondText()" />
      <ai-message-actions class="custom-actions">
        <ai-message-actions-copy />
        <ai-message-actions-thumbs-up
          [active]="thumbsUpActive()"
          (thumbsUp)="thumbsUpCount.update((count) => count + 1)"
        />
        <ai-message-actions-thumbs-down
          [active]="thumbsDownActive()"
          (thumbsDown)="thumbsDownCount.update((count) => count + 1)"
        />
        <button type="button" class="custom-action">Custom action</button>
      </ai-message-actions>
    </ai-message>
  `,
})
class Host {
  readonly firstText = signal('**Assistant** response');
  readonly secondText = signal(['```ts', 'const value = 1;', '```'].join('\n'));
  readonly thumbsUpCount = signal(0);
  readonly thumbsDownCount = signal(0);
  readonly thumbsUpActive = signal(true);
  readonly thumbsDownActive = signal(false);
  readonly message = viewChild.required(Message);
}

@Component({
  imports: [Message, MessageActions, MessageActionsCopy, MessageContent],
  template: `
    <ai-message from="assistant">
      <ai-message-content markdown="Registered text" />
      <ai-message-actions>
        <ai-message-actions-copy text="Explicit text" />
      </ai-message-actions>
    </ai-message>
  `,
})
class ExplicitTextHost {}

@Component({
  imports: [MessageActions],
  template: '<ai-message-actions />',
})
class OrphanActionsHost {}

describe('MessageActions', () => {
  let fixture: ComponentFixture<Host>;
  let writeText: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    writeText = vi.fn(async () => undefined);
    Object.defineProperty(globalThis.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    await TestBed.configureTestingModule({
      imports: [Host],
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('applies button group defaults and preserves projected custom actions', () => {
    const element = fixture.nativeElement as HTMLElement;
    const actions = element.querySelector('ai-message-actions');
    const customAction = element.querySelector('.custom-action');

    expect(actions?.classList).toContain('spartan-button-group');
    expect(actions?.classList).toContain('mr-auto');
    expect(actions?.classList).toContain('custom-actions');
    expect(customAction?.textContent).toContain('Custom action');
  });

  it('copies registered message content by default', async () => {
    const element = fixture.nativeElement as HTMLElement;
    const copy = element.querySelector<HTMLButtonElement>('button[aria-label="Copy message"]');

    copy?.click();
    await fixture.whenStable();

    expect(writeText).toHaveBeenCalledWith(
      ['**Assistant** response', '', '```ts', 'const value = 1;', '```'].join('\n'),
    );
  });

  it('updates copied text when message content changes', async () => {
    fixture.componentInstance.secondText.set('Updated response');
    fixture.detectChanges();
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const copy = element.querySelector<HTMLButtonElement>('button[aria-label="Copy message"]');

    copy?.click();
    await fixture.whenStable();

    expect(writeText).toHaveBeenCalledWith('**Assistant** response\n\nUpdated response');
  });

  it('emits thumbs up and thumbs down actions', async () => {
    const element = fixture.nativeElement as HTMLElement;
    const thumbsUp = element.querySelector<HTMLButtonElement>('button[aria-label="Thumbs up"]');
    const thumbsDown = element.querySelector<HTMLButtonElement>('button[aria-label="Thumbs down"]');

    thumbsUp?.click();
    thumbsDown?.click();
    thumbsDown?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.thumbsUpCount()).toBe(1);
    expect(fixture.componentInstance.thumbsDownCount()).toBe(2);
  });

  it('marks feedback actions as pressed when active', async () => {
    const element = fixture.nativeElement as HTMLElement;
    const thumbsUp = element.querySelector<HTMLButtonElement>('button[aria-label="Thumbs up"]');
    const thumbsDown = element.querySelector<HTMLButtonElement>('button[aria-label="Thumbs down"]');

    expect(thumbsUp?.getAttribute('aria-pressed')).toBe('true');
    expect(thumbsUp?.classList).toContain('bg-muted');
    expect(thumbsUp?.querySelector('ng-icon')?.classList).toContain(
      'ai-message-actions-feedback-icon-active',
    );
    expect(thumbsDown?.getAttribute('aria-pressed')).toBe('false');
    expect(thumbsDown?.classList).not.toContain('bg-muted');

    fixture.componentInstance.thumbsUpActive.set(false);
    fixture.componentInstance.thumbsDownActive.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(thumbsUp?.getAttribute('aria-pressed')).toBe('false');
    expect(thumbsDown?.getAttribute('aria-pressed')).toBe('true');
    expect(thumbsDown?.classList).toContain('bg-muted');
  });

  it('prefers explicit copy text when provided', async () => {
    await TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [ExplicitTextHost],
      })
      .compileComponents();

    const explicitFixture = TestBed.createComponent(ExplicitTextHost);
    explicitFixture.detectChanges();
    await explicitFixture.whenStable();

    const element = explicitFixture.nativeElement as HTMLElement;
    const copy = element.querySelector<HTMLButtonElement>('button[aria-label="Copy message"]');

    copy?.click();
    await explicitFixture.whenStable();

    expect(writeText).toHaveBeenCalledWith('Explicit text');
  });

  it('requires message actions to be inside a message', async () => {
    await TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [OrphanActionsHost],
      })
      .compileComponents();

    expect(() => {
      const orphanFixture = TestBed.createComponent(OrphanActionsHost);
      orphanFixture.detectChanges();
    }).toThrow();
  });
});
