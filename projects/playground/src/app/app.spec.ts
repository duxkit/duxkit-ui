import { TestBed } from '@angular/core/testing';
import type { UIMessage } from 'ai';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ messages: [] }), { status: 200 })),
    );

    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('DuxKit Chat');
  });

  it('renders a consumer-style prompt input with attachment support', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('form[aiPromptInput]')).not.toBeNull();
    expect(compiled.querySelector('textarea[aiPromptInputTextarea]')).not.toBeNull();
    expect(compiled.querySelector('button[aiPromptInputAddAttachment]')).not.toBeNull();
    expect(compiled.querySelector('ai-prompt-input-attachments')).not.toBeNull();
    expect(compiled.querySelector('button[aiPromptInputSubmit]')).not.toBeNull();
  });

  it('sends prompt input text and files through the live chat', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as App & {
      chat: { sendMessage: ReturnType<typeof vi.fn>; status: string };
      sendPrompt: (event: { text: string; files: readonly unknown[] }) => Promise<void>;
    };
    const files = [
      {
        type: 'file',
        mediaType: 'text/plain',
        filename: 'notes.txt',
        url: 'data:text/plain;base64,bm90ZXM=',
      },
    ] as const;

    app.chat.sendMessage = vi.fn(async () => undefined);
    await app.sendPrompt({ text: 'Summarize these notes', files });

    expect(app.chat.sendMessage).toHaveBeenCalledWith({
      text: 'Summarize these notes',
      files,
    });
  });

  it('renders sent image attachments with the built-in preview content', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as App & {
      chat: { messages: UIMessage[] };
    };

    app.chat.messages = [
      {
        id: 'user-image-message',
        role: 'user',
        parts: [
          {
            type: 'file',
            mediaType: 'image/png',
            filename: 'diagram.png',
            url: 'data:image/png;base64,iVBORw0KGgo=',
          },
        ],
      },
    ];

    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const attachment = compiled.querySelector('ai-attachment');

    expect(attachment?.textContent).toContain('diagram.png');
    expect(attachment?.querySelector('img')?.getAttribute('alt')).toBe('diagram.png');
  });
});
