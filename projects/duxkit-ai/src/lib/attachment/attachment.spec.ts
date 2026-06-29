import { Component, signal, viewChild, viewChildren } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HlmButton } from '@duxkit/ui/helm/button';
import type { FileUIPart, SourceDocumentUIPart } from 'ai';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  Attachment,
  Attachments,
  AttachmentPreview,
  AttachmentRemove,
  getAttachmentName,
} from './';

const imagePart: FileUIPart = {
  type: 'file',
  mediaType: 'image/jpeg',
  filename: 'mountain-landscape.jpg',
  url: 'https://example.com/mountain-landscape.jpg',
};

const pdfPart: FileUIPart = {
  type: 'file',
  mediaType: 'application/pdf',
  filename: 'quarterly-report.pdf',
  url: 'https://example.com/quarterly-report.pdf',
};

const videoPart: FileUIPart = {
  type: 'file',
  mediaType: 'video/mp4',
  filename: 'product-demo.mp4',
  url: 'https://example.com/product-demo.mp4',
};

const audioPart: FileUIPart = {
  type: 'file',
  mediaType: 'audio/mpeg',
  filename: 'podcast-episode.mp3',
  url: 'https://example.com/podcast-episode.mp3',
};

const sourcePart: SourceDocumentUIPart = {
  type: 'source-document',
  sourceId: 'source-1',
  mediaType: 'text/html',
  title: 'React Documentation',
  filename: 'react-docs.html',
};

@Component({
  imports: [Attachment, Attachments, AttachmentPreview, AttachmentRemove],
  template: `
    <ai-attachments [variant]="variant()" class="custom-attachments">
      @for (attachment of attachments(); track attachmentKey(attachment)) {
        <ai-attachment
          [data]="attachment"
          class="custom-attachment"
          (removed)="recordRemoved($event)"
        >
          <ai-attachment-preview class="custom-preview" />
          <button aiAttachmentRemove class="custom-remove"></button>
        </ai-attachment>
      }
    </ai-attachments>
  `,
})
class Host {
  readonly variant = signal<'grid' | 'inline' | 'list'>('grid');
  readonly attachments = signal([imagePart, pdfPart, videoPart, sourcePart, audioPart]);
  readonly removedId = signal<string | undefined>(undefined);
  readonly root = viewChild.required(Attachments);
  readonly attachmentChildren = viewChildren(Attachment);

  attachmentKey(part: FileUIPart | SourceDocumentUIPart): string {
    return part.type === 'file' ? (part.filename ?? part.url) : part.sourceId;
  }

  recordRemoved(part: FileUIPart | SourceDocumentUIPart): void {
    this.removedId.set(part.type === 'file' ? (part.filename ?? part.url) : part.title);
  }
}

@Component({
  imports: [AttachmentPreview],
  template: '<ai-attachment-preview />',
})
class OrphanPreviewHost {}

@Component({
  imports: [Attachment, Attachments, AttachmentPreview, AttachmentRemove, HlmButton],
  template: `
    <ai-attachments variant="inline">
      <ai-attachment [data]="attachment">
        <ai-attachment-preview>
          <button aiAttachmentRemove hlmBtn variant="ghost" size="icon-xs"></button>
        </ai-attachment-preview>
      </ai-attachment>
    </ai-attachments>
  `,
})
class InlinePreviewRemoveHost {
  readonly attachment = imagePart;
}

describe('Attachment', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('applies collection variant layout classes and preserves consumer classes', () => {
    const element = fixture.nativeElement as HTMLElement;
    const collection = element.querySelector('ai-attachments');

    expect(collection?.getAttribute('data-variant')).toBe('grid');
    expect(collection?.classList).toContain('grid');
    expect(collection?.classList).toContain('custom-attachments');

    fixture.componentInstance.variant.set('inline');
    fixture.detectChanges();

    expect(collection?.getAttribute('data-variant')).toBe('inline');
    expect(collection?.classList).toContain('flex-wrap');

    fixture.componentInstance.variant.set('list');
    fixture.detectChanges();

    expect(collection?.getAttribute('data-variant')).toBe('list');
    expect(collection?.classList).toContain('flex-col');
  });

  it('derives file and source-document state from AI SDK parts', () => {
    const attachments = fixture.componentInstance.attachmentChildren();
    const image = attachments[0];
    const source = attachments[3];

    expect(image.name()).toBe('mountain-landscape.jpg');
    expect(image.mediaType()).toBe('image/jpeg');
    expect(image.kind()).toBe('image');
    expect(image.url()).toBe('https://example.com/mountain-landscape.jpg');
    expect(image.previewLabel()).toBe('Preview mountain-landscape.jpg');
    expect(image.removeLabel()).toBe('Remove mountain-landscape.jpg');

    expect(source.name()).toBe('React Documentation');
    expect(source.mediaType()).toBe('text/html');
    expect(source.kind()).toBe('source');
    expect(source.url()).toBeUndefined();
    expect(source.descriptionLabel()).toBe('React Documentation, text/html');
  });

  it('renders grid previews for image, document, video, source, and audio attachments', () => {
    const element = fixture.nativeElement as HTMLElement;
    const previews = element.querySelectorAll('ai-attachment-preview');

    expect(previews.length).toBe(5);
    expect(previews[0]?.querySelector('img')?.getAttribute('src')).toBe(
      'https://example.com/mountain-landscape.jpg',
    );
    expect(previews[0]?.querySelector('img')?.getAttribute('alt')).toBe('mountain-landscape.jpg');
    expect(previews[1]?.getAttribute('data-kind')).toBe('document');
    expect(previews[2]?.getAttribute('data-kind')).toBe('video');
    expect(previews[3]?.getAttribute('data-kind')).toBe('source');
    expect(previews[4]?.getAttribute('data-kind')).toBe('audio');
    expect(previews[1]?.querySelector('ng-icon')).not.toBeNull();
    expect(previews[0]?.classList).toContain('custom-preview');
  });

  it('renders inline previews with Spartan Brain hover-card hooks', () => {
    fixture.componentInstance.variant.set('inline');
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const firstAttachment = element.querySelector('ai-attachment');
    const preview = firstAttachment?.querySelector('ai-attachment-preview');
    const hoverCard = preview?.querySelector('[brnHoverCard]');
    const trigger = preview?.querySelector('[brnHoverCardTrigger]');

    expect(preview?.getAttribute('data-variant')).toBe('inline');
    expect(hoverCard).not.toBeNull();
    expect(trigger).not.toBeNull();
    expect(trigger?.getAttribute('tabindex')).toBe('0');
    expect(trigger?.getAttribute('aria-label')).toBe('Preview mountain-landscape.jpg');
    expect(trigger?.textContent).toContain('mountain-landscape.jpg');
  });

  it('uses semantic preview roles and visible keyboard focus styles', () => {
    const element = fixture.nativeElement as HTMLElement;
    let previewVisual = element.querySelector('ai-attachment-preview [aria-label]');

    expect(previewVisual?.getAttribute('role')).toBe('img');

    fixture.componentInstance.variant.set('inline');
    fixture.detectChanges();

    const inlineTrigger = element.querySelector('[brnHoverCardTrigger]');

    expect(inlineTrigger?.getAttribute('role')).toBe('img');
    expect(inlineTrigger?.classList).toContain('focus-visible:ring-2');
    expect(inlineTrigger?.classList).not.toContain('focus-visible:outline-none');

    fixture.componentInstance.variant.set('list');
    fixture.detectChanges();

    previewVisual = element.querySelector('ai-attachment-preview [aria-label]');

    expect(previewVisual?.getAttribute('role')).toBe('img');
  });

  it('emits the current attachment when the remove button is pressed', () => {
    const element = fixture.nativeElement as HTMLElement;
    const button = element.querySelector<HTMLButtonElement>('button[aiAttachmentRemove]');

    expect(button?.getAttribute('type')).toBe('button');
    expect(button?.getAttribute('aria-label')).toBe('Remove mountain-landscape.jpg');
    expect(button?.classList).toContain('custom-remove');

    button?.click();

    expect(fixture.componentInstance.removedId()).toBe('mountain-landscape.jpg');
  });

  it('reveals the grid remove button when the attachment is hovered', () => {
    const element = fixture.nativeElement as HTMLElement;
    const attachment = element.querySelector('ai-attachment');
    const button = attachment?.querySelector<HTMLButtonElement>('button[aiAttachmentRemove]');

    expect(button?.getAttribute('data-slot-variant')).toBe('grid');
    expect(button?.classList).toContain('opacity-0');
    expect(button?.classList).not.toContain('opacity-100');

    attachment?.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();

    expect(button?.classList).toContain('opacity-100');
    expect(button?.classList).not.toContain('opacity-0');
  });

  it('supports a projected inline remove button inside the preview slot', async () => {
    await TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [InlinePreviewRemoveHost],
      })
      .compileComponents();

    const inlineFixture = TestBed.createComponent(InlinePreviewRemoveHost);
    inlineFixture.detectChanges();
    await inlineFixture.whenStable();

    const element = inlineFixture.nativeElement as HTMLElement;
    const attachment = element.querySelector('ai-attachment');
    const preview = element.querySelector('ai-attachment-preview');

    expect(preview?.querySelector('img')?.getAttribute('src')).toBe(
      'https://example.com/mountain-landscape.jpg',
    );
    expect(preview?.querySelector('button[aiAttachmentRemove]')).toBeNull();

    attachment?.dispatchEvent(new MouseEvent('mouseenter'));
    inlineFixture.detectChanges();
    await inlineFixture.whenStable();

    const button = preview?.querySelector<HTMLButtonElement>('button[aiAttachmentRemove]');

    expect(button?.getAttribute('data-slot-variant')).toBe('inline-preview');
    expect(button?.classList).toContain('group/button');
    expect(button?.classList).toContain('!size-5');
  });

  it('keeps the inline remove button reachable when focus moves within the attachment', async () => {
    await TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [InlinePreviewRemoveHost],
      })
      .compileComponents();

    const inlineFixture = TestBed.createComponent(InlinePreviewRemoveHost);
    inlineFixture.detectChanges();
    await inlineFixture.whenStable();

    const element = inlineFixture.nativeElement as HTMLElement;
    const preview = element.querySelector('ai-attachment-preview');
    const trigger = preview?.querySelector('[brnHoverCardTrigger]');

    trigger?.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    inlineFixture.detectChanges();
    await inlineFixture.whenStable();

    const button = preview?.querySelector<HTMLButtonElement>('button[aiAttachmentRemove]');

    expect(button).not.toBeNull();

    trigger?.dispatchEvent(
      new FocusEvent('focusout', {
        bubbles: true,
        relatedTarget: button,
      }),
    );
    inlineFixture.detectChanges();

    expect(preview?.querySelector('button[aiAttachmentRemove]')).not.toBeNull();
  });

  it('requires preview content to be inside an attachment', async () => {
    await TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [OrphanPreviewHost],
      })
      .compileComponents();

    expect(() => {
      const orphanFixture = TestBed.createComponent(OrphanPreviewHost);
      orphanFixture.detectChanges();
    }).toThrow();
  });

  it('derives relative URL filenames without query strings or fragments', () => {
    const part: FileUIPart = {
      type: 'file',
      mediaType: 'application/pdf',
      url: '/uploads/final%20report.pdf?download=1#page=2',
    };

    expect(getAttachmentName(part)).toBe('final report.pdf');
  });
});
