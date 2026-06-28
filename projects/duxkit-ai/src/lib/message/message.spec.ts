import { Component, signal, viewChildren } from '@angular/core';
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

@Component({
  imports: [Message, MessageContent],
  template: `
    <ai-message from="assistant">
      <ai-message-content [markdown]="markdown()" />
    </ai-message>
  `,
})
class MarkdownMessageHost {
  readonly markdown = signal(
    [
      '**Assistant** response',
      '',
      '- item',
      '',
      '| Name | Value |',
      '| --- | --- |',
      '| status | streaming |',
      '',
      '```ts',
      'const value = signal("hello");',
      '```',
    ].join('\n'),
  );
}

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
    expect(user?.classList).toContain('block');
    expect(user?.classList).toContain('w-full');
    expect(user?.classList).toContain('min-w-0');
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

    expect(user?.classList).toContain('bg-muted');
    expect(user?.classList).toContain('text-foreground');
    expect(user?.classList).toContain('block');
    expect(user?.classList).toContain('w-fit');
    expect(user?.classList).toContain('min-w-0');
    expect(user?.classList).toContain('overflow-hidden');
    expect(user?.classList).toContain('custom-content');
    expect(assistant?.classList).not.toContain('bg-muted');
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

  it('renders markdown when the markdown input is provided', async () => {
    await TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [MarkdownMessageHost],
      })
      .compileComponents();

    const markdownFixture = TestBed.createComponent(MarkdownMessageHost);
    markdownFixture.detectChanges();
    await markdownFixture.whenStable();

    const element = markdownFixture.nativeElement as HTMLElement;
    const content = element.querySelector('ai-message-content');

    expect(content?.classList).toContain('w-full');
    expect(content?.classList).not.toContain('w-fit');
    expect(element.querySelector('strong')?.textContent).toBe('Assistant');
    expect(element.querySelector('li')?.textContent).toBe('item');
    expect(element.querySelector('table')).not.toBeNull();
    expect(element.querySelector('th')?.textContent).toBe('Name');
    expect(element.querySelector('td')?.textContent).toBe('status');
    expect(element.querySelector('ai-code-block')).not.toBeNull();
    expect(element.querySelector('ai-code-block')?.getAttribute('data-language')).toBe('ts');
    expect(element.querySelector('ai-code-block code.language-ts')).not.toBeNull();
    expect(element.querySelector('ai-code-block .hljs-keyword')?.textContent).toBe('const');
  });
});
