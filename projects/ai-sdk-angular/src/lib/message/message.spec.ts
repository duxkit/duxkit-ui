import { Component, viewChildren } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Message } from './message';
import { MessageContent } from './message-content';

@Component({
  imports: [Message, MessageContent],
  template: `
    <ai-message from="user" class="custom-message">
      <div aiMessageContent class="custom-content">Element message</div>
    </ai-message>
    <section aiMessage from="assistant">
      <ai-message-content>Attribute message</ai-message-content>
    </section>
    <ai-message from="system">
      <p aiMessageContent>System message</p>
    </ai-message>
  `,
})
class Host {
  readonly messages = viewChildren(Message);
  readonly messageContents = viewChildren(MessageContent);
}

@Component({
  imports: [MessageContent],
  template: '<p aiMessageContent>Orphan message content</p>',
})
class OrphanContentHost {}

describe('Message', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('matches element and attribute usage', () => {
    expect(fixture.componentInstance.messages().length).toBe(3);
    expect(fixture.componentInstance.messageContents().length).toBe(3);
  });

  it('keeps role state on the message container', () => {
    const element = fixture.nativeElement as HTMLElement;
    const user = element.querySelector('ai-message');
    const assistant = element.querySelector('section[aiMessage]');

    expect(user?.classList).toContain('is-user');
    expect(user?.classList).toContain('custom-message');
    expect(user?.classList).not.toContain('bg-primary');
    expect(assistant?.classList).toContain('is-assistant');
    expect(assistant?.classList).not.toContain('bg-muted');
  });

  it('applies role variants to content and preserves consumer classes', () => {
    const element = fixture.nativeElement as HTMLElement;
    const user = element.querySelector('[aiMessageContent]');
    const assistant = element.querySelector('ai-message-content');
    const system = element.querySelector('p[aiMessageContent]');

    expect(user?.classList).toContain('bg-primary');
    expect(user?.classList).toContain('text-primary-foreground');
    expect(user?.classList).toContain('block');
    expect(user?.classList).toContain('w-fit');
    expect(user?.classList).toContain('custom-content');
    expect(assistant?.classList).toContain('bg-muted');
    expect(assistant?.classList).toContain('text-foreground');
    expect(system?.classList).toContain('text-muted-foreground');
  });

  it('requires message content to be inside a message', async () => {
    await TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [OrphanContentHost],
      })
      .compileComponents();

    expect(() => {
      const orphanFixture = TestBed.createComponent(OrphanContentHost);
      orphanFixture.detectChanges();
    }).toThrow();
  });
});
