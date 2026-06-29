import { Component, computed, contentChild, inject, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideFileAudio, lucideFileText, lucideFileVideo, lucideGlobe } from '@ng-icons/lucide';
import {
  BrnHoverCard,
  BrnHoverCardContent,
  BrnHoverCardTrigger,
} from '@spartan-ng/brain/hover-card';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { Attachment } from './attachment';
import { AttachmentRemove } from './attachment-remove';
import { AI_ATTACHMENT_PREVIEW_SLOT } from './attachment-preview-slot';
import type { AiAttachmentKind } from './attachment.types';

const attachmentIconNames: Record<AiAttachmentKind, string> = {
  image: 'lucideFileText',
  video: 'lucideFileVideo',
  audio: 'lucideFileAudio',
  document: 'lucideFileText',
  source: 'lucideGlobe',
};

export const attachmentPreviewVariants = cva('', {
  variants: {
    variant: {
      grid: 'block min-w-0',
      inline: 'inline-flex min-w-0 max-w-full',
      list: 'contents',
    },
  },
  defaultVariants: {
    variant: 'grid',
  },
});

export type AttachmentPreviewVariants = VariantProps<typeof attachmentPreviewVariants>;

@Component({
  selector: '[aiAttachmentPreview],ai-attachment-preview',
  imports: [BrnHoverCard, BrnHoverCardContent, BrnHoverCardTrigger, NgIcon],
  providers: [
    { provide: AI_ATTACHMENT_PREVIEW_SLOT, useValue: true },
    provideIcons({
      lucideFileAudio,
      lucideFileText,
      lucideFileVideo,
      lucideGlobe,
    }),
  ],
  host: {
    '[class]': 'classes()',
    '[attr.data-kind]': 'attachment.kind()',
    '[attr.data-variant]': 'attachment.variant()',
  },
  template: `
    @switch (attachment.variant()) {
      @case ('inline') {
        <span brnHoverCard class="inline-flex min-w-0 max-w-full items-center gap-1.5">
          <span
            brnHoverCardTrigger
            [brnHoverCardTriggerFor]="previewCard"
            class="inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            tabindex="0"
            role="img"
            [attr.aria-label]="attachment.previewLabel()"
          >
            <span
              class="inline-flex size-5 aspect-square shrink-0 items-center justify-center overflow-hidden rounded bg-background text-muted-foreground"
            >
              @if (attachment.kind() === 'image' && attachment.url() !== undefined) {
                <img
                  class="size-full rounded object-cover"
                  [src]="attachment.url()"
                  [alt]="attachment.name()"
                />
              } @else {
                <ng-icon [name]="iconName()" style="--ng-icon__size: 12px" aria-hidden="true" />
              }
            </span>
            <span class="min-w-0 truncate">{{ attachment.name() }}</span>
          </span>
          @if (projectedRemove() !== undefined && attachment.hovered()) {
            <ng-content select="[aiAttachmentRemove],ai-attachment-remove" />
          }

          <ng-template #previewCard="brnHoverCardContent" brnHoverCardContent>
            <div
              class="grid w-64 gap-3 rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-md"
            >
              @if (attachment.kind() === 'image' && attachment.url() !== undefined) {
                <img
                  class="aspect-video w-full rounded-md object-cover"
                  [src]="attachment.url()"
                  [alt]="attachment.name()"
                />
              }
              <div class="grid min-w-0 gap-1">
                <div class="truncate font-medium">{{ attachment.name() }}</div>
                <div class="truncate text-muted-foreground text-xs">
                  {{ attachment.mediaType() }}
                </div>
              </div>
            </div>
          </ng-template>
        </span>
      }

      @case ('list') {
        <span class="flex min-w-0 flex-1 items-center gap-3">
          <span
            class="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground"
            role="img"
            [attr.aria-label]="attachment.previewLabel()"
          >
            @if (attachment.kind() === 'image' && attachment.url() !== undefined) {
              <img
                class="size-full object-cover"
                [src]="attachment.url()"
                [alt]="attachment.name()"
              />
            } @else {
              <ng-icon [name]="iconName()" style="--ng-icon__size: 18px" aria-hidden="true" />
            }
          </span>
          <span class="grid min-w-0 gap-0.5">
            <span class="truncate text-sm">{{ attachment.name() }}</span>
            <span class="truncate text-muted-foreground text-xs">{{ attachment.mediaType() }}</span>
          </span>
        </span>
      }

      @default {
        <span
          class="flex size-full aspect-square items-center justify-center overflow-hidden bg-muted text-muted-foreground"
          role="img"
          [attr.aria-label]="attachment.previewLabel()"
        >
          @if (attachment.kind() === 'image' && attachment.url() !== undefined) {
            <img
              class="size-full object-cover"
              [src]="attachment.url()"
              [alt]="attachment.name()"
            />
          } @else {
            <ng-icon [name]="iconName()" style="--ng-icon__size: 20px" aria-hidden="true" />
          }
        </span>
      }
    }
  `,
})
export class AttachmentPreview {
  protected readonly attachment = inject(Attachment);
  protected readonly projectedRemove = contentChild(AttachmentRemove);

  /** Additional classes merged onto the attachment preview element. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly iconName = computed(() => attachmentIconNames[this.attachment.kind()]);
  protected readonly classes = computed(() =>
    twMerge(attachmentPreviewVariants({ variant: this.attachment.variant() }), this.userClass()),
  );
}
