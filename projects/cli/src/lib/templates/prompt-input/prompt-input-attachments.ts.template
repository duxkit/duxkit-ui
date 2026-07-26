import { Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePaperclip } from '@ng-icons/lucide';
import { twMerge } from 'tailwind-merge';
import {
  Attachment,
  AttachmentName,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from '../attachment';
import { promptInputButtonVariants } from './prompt-input-button';
import { injectPromptInput } from './prompt-input-root';
import type { PromptInputButtonVariants } from './prompt-input-button';

@Component({
  selector: 'button[aiPromptInputAddAttachment],button[ai-prompt-input-add-attachment]',
  imports: [NgIcon],
  providers: [provideIcons({ lucidePaperclip })],
  host: {
    '[class]': 'classes()',
    '[attr.type]': 'buttonType()',
    '[attr.aria-label]': 'ariaLabel()',
    '(click)': 'openFileDialog($event)',
  },
  template: `
    <ng-content>
      <ng-icon name="lucidePaperclip" style="--ng-icon__size: 16px" aria-hidden="true" />
    </ng-content>
  `,
})
export class PromptInputAddAttachment {
  private readonly promptInput = injectPromptInput();

  /** Accessible label for the add attachment control. */
  public readonly ariaLabel = input('Add attachment');
  /** Visual size for the add attachment control. */
  public readonly size = input<PromptInputButtonVariants['size']>('icon-sm');
  /** Additional classes merged onto the add attachment control. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly buttonType = computed(() => 'button');
  protected readonly classes = computed(() =>
    twMerge(promptInputButtonVariants({ size: this.size() }), this.userClass()),
  );

  protected openFileDialog(event: Event): void {
    event.preventDefault();
    this.promptInput.openFileDialog();
  }
}

@Component({
  selector: '[aiPromptInputAttachments],ai-prompt-input-attachments',
  imports: [Attachment, AttachmentName, AttachmentPreview, AttachmentRemove, Attachments],
  host: {
    '[class]': 'classes()',
  },
  template: `
    @if (promptInput.files().length > 0) {
      <ai-attachments variant="inline">
        @for (file of promptInput.files(); track file.id) {
          <ai-attachment [data]="file" (removed)="promptInput.removeFile(file.id)">
            <ai-attachment-preview>
              <ai-attachment-name>{{ file.filename ?? file.url }}</ai-attachment-name>
              <button aiAttachmentRemove></button>
            </ai-attachment-preview>
          </ai-attachment>
        }
      </ai-attachments>
    }
  `,
})
export class PromptInputAttachments {
  protected readonly promptInput = injectPromptInput();

  /** Additional classes merged onto the prompt input attachment list. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() => twMerge('flex min-w-0 px-2 pb-1', this.userClass()));
}
