import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  booleanAttribute,
  computed,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  model,
  numberAttribute,
  output,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { twMerge } from 'tailwind-merge';
import type {
  AiPromptSubmit,
  PromptInputFileError,
  PromptInputFilePart,
  PromptInputStatus,
} from './prompt-input.types';

export const promptInputClasses =
  'relative flex w-full min-w-0 flex-col overflow-hidden rounded-xl border border-input bg-background text-foreground shadow-xs transition-colors focus-within:ring-2 focus-within:ring-ring';

let promptInputId = 0;

@Directive({
  exportAs: 'aiPromptInput',
  selector: 'form[aiPromptInput]',
  host: {
    '[class]': 'classes()',
    '[attr.data-status]': 'status()',
    '(submit)': 'submitFromEvent($event)',
    '(dragover)': 'handleDragOver($event)',
    '(drop)': 'handleDrop($event)',
  },
})
export class PromptInput {
  private readonly elementRef = inject<ElementRef<HTMLFormElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** File accept pattern passed to the hidden attachment input. */
  public readonly accept = input<string | undefined>(undefined);
  /** Whether the hidden attachment input allows multiple files. */
  public readonly multiple = input(false, { transform: booleanAttribute });
  /** Maximum number of files accepted by the prompt input. */
  public readonly maxFiles = input<number | undefined, unknown>(undefined, {
    transform: (value) => optionalNumber(value),
  });
  /** Maximum file size in bytes accepted by the prompt input. */
  public readonly maxFileSize = input<number | undefined, unknown>(undefined, {
    transform: (value) => optionalNumber(value),
  });
  /** Current chat status used by child controls. */
  public readonly status = input<PromptInputStatus>('ready');
  /** Additional classes merged onto the prompt input form. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });
  /** Emits validated prompt text and attached files when the form submits. */
  public readonly promptSubmit = output<AiPromptSubmit>();
  /** Emits when files are rejected by accept, size, or count constraints. */
  public readonly fileError = output<PromptInputFileError>();

  /** Controlled prompt text. */
  public readonly text = model('');
  /** Controlled file parts. Use addFiles for validated local uploads. External URLs remain consumer-owned. */
  public readonly files = model<readonly PromptInputFilePart[]>([]);
  /** Disable every submission path. */
  public readonly disabled = input(false, { transform: booleanAttribute });
  /** Allow additional prompts during generation. */
  public readonly allowSubmitWhileGenerating = input(false, { transform: booleanAttribute });
  /** Clear the submitted draft automatically; disable to clear after async success. */
  public readonly resetOnSubmit = input(true, { transform: booleanAttribute });
  private readonly submitting = signal(false);
  private readonly ownedUrls = new Set<string>();
  private readonly submissionAllowed = computed(
    () =>
      !this.disabled() &&
      (this.allowSubmitWhileGenerating() || !['submitted', 'streaming'].includes(this.status())),
  );
  public readonly canSubmit = computed(() => this.submissionAllowed() && !this.submitting());
  public readonly attachmentInputId = `ai-prompt-input-file-${++promptInputId}`;

  private readonly fileInput = this.isBrowser ? this.createFileInput() : undefined;

  protected readonly classes = computed(() => twMerge(promptInputClasses, this.userClass()));

  public constructor() {
    effect(() => {
      const accept = this.accept();
      if (!this.fileInput) {
        return;
      }

      if (accept) {
        this.fileInput.accept = accept;
      } else {
        this.fileInput.removeAttribute('accept');
      }
      this.fileInput.multiple = this.multiple();
    });

    effect(() => {
      const active = new Set(this.files().map((file) => file.url));
      for (const url of this.ownedUrls) {
        if (!active.has(url)) {
          URL.revokeObjectURL(url);
          this.ownedUrls.delete(url);
        }
      }
    });

    this.destroyRef.onDestroy(() => {
      for (const url of this.ownedUrls) URL.revokeObjectURL(url);
      this.ownedUrls.clear();
      this.fileInput?.remove();
    });
  }

  public setText(value: string): void {
    this.text.set(value);
  }

  public openFileDialog(): void {
    this.fileInput?.click();
  }

  public addFiles(fileList: FileList | readonly File[]): void {
    const incoming = Array.from(fileList);

    if (incoming.length === 0) {
      return;
    }

    const rejectedByType = incoming.filter((file) => !this.matchesAccept(file));
    const accepted = incoming.filter((file) => this.matchesAccept(file));
    const rejectedBySize = accepted.filter((file) => !this.matchesMaxFileSize(file));
    const sized = accepted.filter((file) => this.matchesMaxFileSize(file));

    if (rejectedByType.length > 0) {
      this.emitFileError('accept', 'Some files do not match the accepted types.', rejectedByType);
    }

    if (rejectedBySize.length > 0) {
      this.emitFileError('max_file_size', 'Some files exceed the maximum size.', rejectedBySize);
    }

    const maxFiles = this.maxFiles();
    const existing = this.files();
    const capacity =
      typeof maxFiles === 'number' ? Math.max(0, maxFiles - existing.length) : sized.length;
    const capped = sized.slice(0, capacity);
    const rejectedByCount = sized.slice(capacity);

    if (rejectedByCount.length > 0) {
      this.emitFileError('max_files', 'Too many files. Some were not added.', rejectedByCount);
    }

    if (capped.length === 0) {
      return;
    }

    this.files.set([
      ...existing,
      ...capped.map((file) => ({
        file,
        filename: file.name,
        id: createPromptInputFileId(),
        mediaType: file.type,
        type: 'file' as const,
        url: this.createOwnedUrl(file),
      })),
    ]);
  }

  public removeFile(id: string): void {
    const found = this.files().find((file) => file.id === id);
    if (found) {
      this.releaseUrl(found.url);
    }
    this.files.update((files) => files.filter((file) => file.id !== id));
  }

  public removeLastFile(): void {
    const last = this.files().at(-1);
    if (last) {
      this.removeFile(last.id);
    }
  }

  public async submit(): Promise<void> {
    if (!this.canSubmit()) return;
    const text = this.text();
    const files = this.files();
    this.submitting.set(true);
    try {
      const payload: AiPromptSubmit = {
        text,
        files: await Promise.all(
          files.map(async ({ file, id: _id, ...part }) => {
            return {
              ...part,
              url: await fileToDataUrl(file),
            };
          }),
        ),
      };

      if (!this.submissionAllowed() || this.destroyRef.destroyed) return;
      this.promptSubmit.emit(payload);
      if (this.resetOnSubmit() && this.text() === text && this.files() === files) this.clear();
    } finally {
      this.submitting.set(false);
    }
  }

  public clear(): void {
    for (const file of this.files()) {
      this.releaseUrl(file.url);
    }
    this.files.set([]);
    this.text.set('');

    if (this.fileInput) {
      this.fileInput.value = '';
    }
  }

  protected submitFromEvent(event: Event): void {
    event.preventDefault();
    void this.submit();
  }

  protected handleDragOver(event: DragEvent): void {
    if (!event.dataTransfer?.types.includes('Files')) {
      return;
    }

    event.preventDefault();
  }

  protected handleDrop(event: DragEvent): void {
    if (!event.dataTransfer?.types.includes('Files')) {
      return;
    }

    event.preventDefault();
    this.addFiles(event.dataTransfer.files);
  }

  private createOwnedUrl(file: File): string {
    const url = URL.createObjectURL(file);
    this.ownedUrls.add(url);
    return url;
  }

  private releaseUrl(url: string): void {
    if (this.ownedUrls.delete(url)) URL.revokeObjectURL(url);
  }

  private createFileInput(): HTMLInputElement {
    const inputElement = this.document.createElement('input');
    inputElement.id = this.attachmentInputId;
    inputElement.type = 'file';
    inputElement.hidden = true;
    inputElement.tabIndex = -1;
    inputElement.setAttribute('aria-label', 'Upload files');
    inputElement.addEventListener('change', () => {
      if (inputElement.files) {
        this.addFiles(inputElement.files);
      }
      inputElement.value = '';
    });

    this.elementRef.nativeElement.append(inputElement);
    return inputElement;
  }

  private matchesAccept(file: File): boolean {
    const accept = this.accept()?.trim();

    if (!accept) {
      return true;
    }

    return accept
      .split(',')
      .map((pattern) => pattern.trim())
      .filter(Boolean)
      .some((pattern) => {
        if (pattern.startsWith('.')) {
          return file.name.toLowerCase().endsWith(pattern.toLowerCase());
        }

        if (pattern.endsWith('/*')) {
          return file.type.startsWith(pattern.slice(0, -1));
        }

        return file.type === pattern;
      });
  }

  private matchesMaxFileSize(file: File): boolean {
    const maxFileSize = this.maxFileSize();
    return typeof maxFileSize !== 'number' || file.size <= maxFileSize;
  }

  private emitFileError(
    code: PromptInputFileError['code'],
    message: string,
    files: readonly File[],
  ): void {
    this.fileError.emit({ code, message, files });
  }
}

export function injectPromptInput(): PromptInput {
  const promptInput = inject(PromptInput, { optional: true });

  if (!promptInput) {
    throw new Error('Prompt input components must be used within PromptInput');
  }

  return promptInput;
}

function optionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = numberAttribute(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function createPromptInputFileId(): string {
  return `prompt-file-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
}

async function fileToDataUrl(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return `data:${file.type || 'application/octet-stream'};base64,${btoa(binary)}`;
}
