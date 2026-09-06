import { computed, Directive, ElementRef, inject, input, signal } from '@angular/core';
import { twMerge } from 'tailwind-merge';
import { injectPromptInput } from './prompt-input-root';

export const promptInputTextareaClasses =
  'field-sizing-content max-h-48 min-h-16 w-full resize-none overflow-y-auto border-0 bg-transparent px-3 py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50';

@Directive({
  selector: 'textarea[aiPromptInputTextarea],textarea[ai-prompt-input-textarea]',
  host: {
    '[class]': 'classes()',
    '[value]': 'promptInput.text()',
    '[attr.name]': 'name()',
    '(input)': 'handleInput($event)',
    '(keydown)': 'handleKeydown($event)',
    '(paste)': 'handlePaste($event)',
    '(compositionstart)': 'isComposing.set(true)',
    '(compositionend)': 'isComposing.set(false)',
  },
})
export class PromptInputTextarea {
  protected readonly promptInput = injectPromptInput();
  private readonly elementRef = inject<ElementRef<HTMLTextAreaElement>>(ElementRef);

  /** Form field name used for the prompt textarea. */
  public readonly name = input('message');
  /** Additional classes merged onto the prompt textarea. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly isComposing = signal(false);
  protected readonly classes = computed(() =>
    twMerge(promptInputTextareaClasses, this.userClass()),
  );

  protected handleInput(event: Event): void {
    this.promptInput.setText((event.target as HTMLTextAreaElement).value);
  }

  protected handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Backspace' && this.elementRef.nativeElement.value === '') {
      this.promptInput.removeLastFile();
      return;
    }

    if (event.key !== 'Enter' || event.shiftKey) {
      return;
    }

    if (this.isComposing() || event.isComposing) {
      return;
    }

    event.preventDefault();

    void this.promptInput.submit();
  }

  protected handlePaste(event: ClipboardEvent): void {
    const items = event.clipboardData?.items;

    if (!items) {
      return;
    }

    const files = Array.from(items)
      .filter((item) => item.kind === 'file')
      .map((item) => item.getAsFile())
      .filter((file): file is File => file !== null);

    if (files.length === 0) {
      return;
    }

    event.preventDefault();
    this.promptInput.addFiles(files);
  }
}
