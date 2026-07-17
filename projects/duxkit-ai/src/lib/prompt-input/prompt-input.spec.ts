import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HlmButton } from '@duxkit-private/ui/helm/button';
import type { FileUIPart } from 'ai';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  PromptInput,
  PromptInputAddAttachment,
  PromptInputAttachments,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  type PromptInputFileError,
} from './';
import type { AiPromptSubmit } from './prompt-input.types';

@Component({
  imports: [
    PromptInput,
    PromptInputAddAttachment,
    PromptInputAttachments,
    PromptInputButton,
    PromptInputSubmit,
    PromptInputTextarea,
    PromptInputToolbar,
    PromptInputTools,
  ],
  template: `
    <form
      aiPromptInput
      class="custom-root"
      [accept]="accept()"
      [maxFiles]="maxFiles()"
      [maxFileSize]="maxFileSize()"
      [status]="status()"
      (promptSubmit)="recordSubmit($event)"
      (fileError)="recordFileError($event)"
    >
      <textarea
        aiPromptInputTextarea
        class="custom-textarea"
        placeholder="Ask a question"
      ></textarea>
      <ai-prompt-input-attachments />
      <ai-prompt-input-toolbar class="custom-toolbar">
        <ai-prompt-input-tools class="custom-tools">
          <button aiPromptInputAddAttachment class="custom-add">Attach</button>
          <button aiPromptInputButton class="custom-button">Tool</button>
          <ai-prompt-input-button [disabled]="customButtonDisabled()">
            Custom
          </ai-prompt-input-button>
        </ai-prompt-input-tools>
        <button
          aiPromptInputSubmit
          class="custom-submit"
          [status]="status()"
          (stop)="stopped.set(true)"
        ></button>
      </ai-prompt-input-toolbar>
    </form>
  `,
})
class Host {
  readonly accept = signal<string | undefined>(undefined);
  readonly maxFiles = signal<number | undefined>(undefined);
  readonly maxFileSize = signal<number | undefined>(undefined);
  readonly status = signal<'ready' | 'submitted' | 'streaming' | 'error'>('ready');
  readonly customButtonDisabled = signal(true);
  readonly submitted = signal<AiPromptSubmit | undefined>(undefined);
  readonly error = signal<PromptInputFileError | undefined>(undefined);
  readonly stopped = signal(false);
  readonly promptInput = viewChild.required(PromptInput);

  recordSubmit(event: AiPromptSubmit): void {
    this.submitted.set(event);
  }

  recordFileError(error: PromptInputFileError): void {
    this.error.set(error);
  }
}

@Component({
  imports: [PromptInputTextarea],
  template: '<textarea aiPromptInputTextarea></textarea>',
})
class OrphanTextareaHost {}

@Component({
  imports: [PromptInput, PromptInputSubmit, HlmButton],
  template: `
    <form aiPromptInput>
      <button aiPromptInputSubmit hlmBtn class="custom-submit"></button>
    </form>
  `,
})
class HlmSubmitHost {}

function createFile(name: string, type: string, size = 128): File {
  return new File(['x'.repeat(size)], name, { type });
}

function setTextareaValue(textarea: HTMLTextAreaElement, value: string): void {
  textarea.value = value;
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
}

function keyboardEvent(type: string, key: string, options: KeyboardEventInit = {}): KeyboardEvent {
  return new KeyboardEvent(type, { bubbles: true, key, ...options });
}

function clipboardPasteEvent(files: readonly File[]): ClipboardEvent {
  const event = new Event('paste', { bubbles: true, cancelable: true }) as ClipboardEvent;
  Object.defineProperty(event, 'clipboardData', {
    value: {
      items: files.map((file) => ({
        kind: 'file',
        getAsFile: () => file,
      })),
    },
  });
  return event;
}

function dropEvent(files: readonly File[]): DragEvent {
  const event = new Event('drop', { bubbles: true, cancelable: true }) as DragEvent;
  Object.defineProperty(event, 'dataTransfer', {
    value: {
      files,
      types: ['Files'],
    },
  });
  return event;
}

describe('PromptInput', () => {
  let fixture: ComponentFixture<Host>;
  let element: HTMLElement;
  let objectUrlIndex = 0;

  beforeEach(async () => {
    objectUrlIndex = 0;
    Object.defineProperty(globalThis.URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(() => `blob:prompt-input-${++objectUrlIndex}`),
    });
    Object.defineProperty(globalThis.URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    });

    await TestBed.configureTestingModule({
      imports: [Host],
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders the root, textarea, controls, and preserves consumer classes', () => {
    const form = element.querySelector<HTMLFormElement>('form[aiPromptInput]');
    const textarea = element.querySelector<HTMLTextAreaElement>('textarea[aiPromptInputTextarea]');
    const toolbar = element.querySelector('ai-prompt-input-toolbar');
    const tools = element.querySelector('ai-prompt-input-tools');
    const addButton = element.querySelector<HTMLButtonElement>(
      'button[aiPromptInputAddAttachment]',
    );
    const customButton = element.querySelector<HTMLButtonElement>('button[aiPromptInputButton]');
    const submit = element.querySelector<HTMLButtonElement>('button[aiPromptInputSubmit]');

    expect(form?.classList).toContain('custom-root');
    expect(form?.classList).toContain('rounded-xl');
    expect(textarea?.placeholder).toBe('Ask a question');
    expect(textarea?.name).toBe('message');
    expect(textarea?.classList).toContain('custom-textarea');
    expect(textarea?.classList).toContain('max-h-48');
    expect(textarea?.classList).toContain('overflow-y-auto');
    expect(toolbar?.classList).toContain('custom-toolbar');
    expect(tools?.classList).toContain('custom-tools');
    expect(addButton?.type).toBe('button');
    expect(addButton?.classList).toContain('custom-add');
    expect(customButton?.type).toBe('button');
    expect(customButton?.classList).toContain('custom-button');
    expect(submit?.type).toBe('submit');
    expect(submit?.getAttribute('aria-label')).toBe('Submit prompt');
    expect(submit?.classList).toContain('custom-submit');
  });

  it('submits text with Enter and preserves Shift+Enter for new lines', async () => {
    const textarea = element.querySelector<HTMLTextAreaElement>('textarea[aiPromptInputTextarea]')!;

    setTextareaValue(textarea, 'Summarize this');
    textarea.dispatchEvent(keyboardEvent('keydown', 'Enter'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.submitted()).toEqual({
      text: 'Summarize this',
      files: [],
    });
    expect(textarea.value).toBe('');

    setTextareaValue(textarea, 'line one');
    textarea.dispatchEvent(keyboardEvent('keydown', 'Enter', { shiftKey: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.submitted()?.text).toBe('Summarize this');
    expect(textarea.value).toBe('line one');
  });

  it('does not submit while IME composition is active', async () => {
    const textarea = element.querySelector<HTMLTextAreaElement>('textarea[aiPromptInputTextarea]')!;

    setTextareaValue(textarea, 'こんにちは');
    textarea.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
    textarea.dispatchEvent(keyboardEvent('keydown', 'Enter'));
    fixture.detectChanges();

    expect(fixture.componentInstance.submitted()).toBeUndefined();

    textarea.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
    textarea.dispatchEvent(keyboardEvent('keydown', 'Enter'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.submitted()?.text).toBe('こんにちは');
  });

  it('adds pasted and dropped files, renders attachments, and removes them', () => {
    const textarea = element.querySelector<HTMLTextAreaElement>('textarea[aiPromptInputTextarea]')!;
    const form = element.querySelector<HTMLFormElement>('form[aiPromptInput]')!;
    const image = createFile('diagram.png', 'image/png');
    const pdf = createFile('brief.pdf', 'application/pdf');

    textarea.dispatchEvent(clipboardPasteEvent([image]));
    form.dispatchEvent(dropEvent([pdf]));
    fixture.detectChanges();

    const attachments = element.querySelectorAll('ai-attachment');

    expect(
      fixture.componentInstance
        .promptInput()
        .files()
        .map((file) => file.filename),
    ).toEqual(['diagram.png', 'brief.pdf']);
    expect(attachments.length).toBe(2);
    expect(element.textContent).toContain('diagram.png');
    expect(element.textContent).toContain('brief.pdf');

    element.querySelector('ai-attachment')?.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();

    const firstRemove = element.querySelector<HTMLButtonElement>('button[aiAttachmentRemove]');
    firstRemove?.click();
    fixture.detectChanges();

    expect(
      fixture.componentInstance
        .promptInput()
        .files()
        .map((file) => file.filename),
    ).toEqual(['brief.pdf']);
  });

  it('validates accepted type, file size, and max files before adding attachments', () => {
    const textarea = element.querySelector<HTMLTextAreaElement>('textarea[aiPromptInputTextarea]')!;

    fixture.componentInstance.accept.set('image/*');
    fixture.detectChanges();
    textarea.dispatchEvent(clipboardPasteEvent([createFile('brief.pdf', 'application/pdf')]));
    fixture.detectChanges();

    expect(fixture.componentInstance.error()?.code).toBe('accept');
    expect(fixture.componentInstance.promptInput().files()).toEqual([]);

    fixture.componentInstance.accept.set(undefined);
    fixture.componentInstance.maxFileSize.set(2);
    fixture.detectChanges();
    textarea.dispatchEvent(clipboardPasteEvent([createFile('large.png', 'image/png', 16)]));
    fixture.detectChanges();

    expect(fixture.componentInstance.error()?.code).toBe('max_file_size');
    expect(fixture.componentInstance.promptInput().files()).toEqual([]);

    fixture.componentInstance.maxFileSize.set(undefined);
    fixture.componentInstance.maxFiles.set(1);
    fixture.detectChanges();
    textarea.dispatchEvent(
      clipboardPasteEvent([createFile('one.png', 'image/png'), createFile('two.png', 'image/png')]),
    );
    fixture.detectChanges();

    expect(fixture.componentInstance.error()?.code).toBe('max_files');
    expect(fixture.componentInstance.error()?.files.map((file) => file.name)).toEqual(['two.png']);
    expect(
      fixture.componentInstance
        .promptInput()
        .files()
        .map((file) => file.filename),
    ).toEqual(['one.png']);
  });

  it('adds valid files while reporting only rejected files from a mixed batch', () => {
    fixture.componentInstance.accept.set('image/*');
    fixture.detectChanges();

    fixture.componentInstance
      .promptInput()
      .addFiles([
        createFile('diagram.png', 'image/png'),
        createFile('brief.pdf', 'application/pdf'),
      ]);
    fixture.detectChanges();

    expect(
      fixture.componentInstance
        .promptInput()
        .files()
        .map((file) => file.filename),
    ).toEqual(['diagram.png']);
    expect(fixture.componentInstance.error()).toEqual(
      expect.objectContaining({
        code: 'accept',
        files: [expect.objectContaining({ name: 'brief.pdf' })],
      }),
    );
  });

  it('submits text and files as stable data URLs, then clears local input state', async () => {
    const textarea = element.querySelector<HTMLTextAreaElement>('textarea[aiPromptInputTextarea]')!;
    const file = createFile('diagram.png', 'image/png', 1);

    setTextareaValue(textarea, 'Use this image');
    textarea.dispatchEvent(clipboardPasteEvent([file]));
    fixture.detectChanges();

    await fixture.componentInstance.promptInput().submit();
    fixture.detectChanges();

    const submitted = fixture.componentInstance.submitted();

    expect(submitted?.text).toBe('Use this image');
    expect(submitted?.files.map((part) => (part as FileUIPart).filename)).toEqual(['diagram.png']);
    expect((submitted?.files[0] as FileUIPart | undefined)?.url).toBe('data:image/png;base64,eA==');
    expect(textarea.value).toBe('');
    expect(fixture.componentInstance.promptInput().files()).toEqual([]);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:prompt-input-1');
  });

  it('turns the submit control into a stop button while streaming', () => {
    fixture.componentInstance.status.set('streaming');
    fixture.detectChanges();

    const submit = element.querySelector<HTMLButtonElement>('button[aiPromptInputSubmit]')!;

    expect(submit.type).toBe('button');
    expect(submit.getAttribute('aria-label')).toBe('Stop response');

    submit.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.stopped()).toBe(true);
    expect(fixture.componentInstance.submitted()).toBeUndefined();
  });

  it('spins the submit icon while the response is submitted', () => {
    fixture.componentInstance.status.set('submitted');
    fixture.detectChanges();

    const icon = element.querySelector('button[aiPromptInputSubmit] ng-icon');

    expect(icon?.classList).toContain('animate-spin');
  });

  it('keeps HLM button classes when composed with hlmBtn', async () => {
    await TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [HlmSubmitHost],
      })
      .compileComponents();

    const hlmFixture = TestBed.createComponent(HlmSubmitHost);
    hlmFixture.detectChanges();
    await hlmFixture.whenStable();

    const button = hlmFixture.nativeElement.querySelector(
      'button[aiPromptInputSubmit]',
    ) as HTMLButtonElement | null;

    expect(button?.classList).toContain('custom-submit');
    expect(button?.classList).toContain('group/button');
  });

  it('does not activate a disabled custom prompt button from the keyboard', () => {
    const button = element.querySelector<HTMLElement>('ai-prompt-input-button')!;
    const click = vi.fn((event: Event) => event.preventDefault());

    button.setAttribute('disabled', '');
    button.addEventListener('click', click);
    button.dispatchEvent(keyboardEvent('keydown', 'Enter'));

    expect(click).not.toHaveBeenCalled();
  });

  it('throws a clear error when child pieces are used outside the root', async () => {
    await TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [OrphanTextareaHost],
      })
      .compileComponents();

    expect(() => {
      const orphanFixture = TestBed.createComponent(OrphanTextareaHost);
      orphanFixture.detectChanges();
    }).toThrowError('Prompt input components must be used within PromptInput');
  });
});
