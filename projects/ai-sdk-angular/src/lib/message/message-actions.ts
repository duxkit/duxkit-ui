import {
  Component,
  computed,
  Directive,
  inject,
  input,
  output,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideCopy, lucideThumbsDown, lucideThumbsUp } from '@ng-icons/lucide';
import { HlmButton } from 'ai-sdk-angular/helm/button';
import { HlmButtonGroup } from 'ai-sdk-angular/helm/button-group';
import { HlmIcon } from 'ai-sdk-angular/helm/icon';
import { classes } from 'ai-sdk-angular/helm/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Message } from './message';

export const messageActionsVariants = cva(
  'mt-2 flex w-fit items-center gap-1 text-muted-foreground',
  {
    variants: {
      from: {
        user: 'ml-auto',
        assistant: 'mr-auto',
        system: 'mx-auto',
      },
    },
    defaultVariants: {
      from: 'assistant',
    },
  },
);

export type MessageActionsVariants = VariantProps<typeof messageActionsVariants>;

const feedbackButtonClasses = cva('', {
  variants: {
    active: {
      true: 'bg-muted text-foreground',
      false: '',
    },
  },
  defaultVariants: {
    active: false,
  },
});

const feedbackIconStyles = `
  .ai-message-actions-feedback-icon-active svg path:first-child {
    fill: currentColor;
  }
`;

@Directive({
  selector: 'ai-message-actions,[aiMessageActions]',
  hostDirectives: [{ directive: HlmButtonGroup, inputs: ['orientation'] }],
  host: {
    'aria-label': 'Message actions',
  },
})
export class MessageActions {
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  private readonly message = inject(Message);

  constructor() {
    classes(() => [
      messageActionsVariants({
        from: this.message.from(),
      }),
      this.userClass(),
    ]);
  }
}

@Component({
  selector: 'ai-message-actions-copy',
  imports: [HlmButton, HlmIcon, NgIcon],
  providers: [provideIcons({ lucideCheck, lucideCopy })],
  template: `
    <button
      hlmBtn
      type="button"
      variant="ghost"
      size="icon-xs"
      [disabled]="!canCopy()"
      [title]="label()"
      [attr.aria-label]="label()"
      (click)="copy()"
    >
      <ng-icon hlmIcon size="sm" [name]="copied() ? 'lucideCheck' : 'lucideCopy'" />
    </button>
  `,
})
export class MessageActionsCopy {
  public readonly text = input<string | undefined>();
  public readonly copiedChange = output<string>();

  private readonly message = inject(Message);

  protected readonly copied = signal(false);
  protected readonly copyText = computed(() => this.text() ?? this.message.copyText());
  protected readonly canCopy = computed(() => this.copyText().trim().length > 0);
  protected readonly label = computed(() => (this.copied() ? 'Copied message' : 'Copy message'));

  protected async copy(): Promise<void> {
    const text = this.copyText().trim();

    if (text.length === 0) {
      return;
    }

    await globalThis.navigator?.clipboard?.writeText(text);

    this.copied.set(true);
    this.copiedChange.emit(text);
    globalThis.setTimeout(() => this.copied.set(false), 1400);
  }
}

@Component({
  selector: 'ai-message-actions-thumbs-up',
  imports: [HlmButton, HlmIcon, NgIcon],
  providers: [provideIcons({ lucideThumbsUp })],
  encapsulation: ViewEncapsulation.None,
  styles: [feedbackIconStyles],
  template: `
    <button
      hlmBtn
      type="button"
      variant="ghost"
      size="icon-xs"
      [class]="classes()"
      title="Thumbs up"
      aria-label="Thumbs up"
      [attr.aria-pressed]="active()"
      (click)="thumbsUp.emit()"
    >
      <ng-icon
        hlmIcon
        size="sm"
        name="lucideThumbsUp"
        [class.ai-message-actions-feedback-icon-active]="active()"
      />
    </button>
  `,
})
export class MessageActionsThumbsUp {
  public readonly active = input(false);
  public readonly thumbsUp = output<void>();

  protected readonly classes = computed(() => feedbackButtonClasses({ active: this.active() }));
}

@Component({
  selector: 'ai-message-actions-thumbs-down',
  imports: [HlmButton, HlmIcon, NgIcon],
  providers: [provideIcons({ lucideThumbsDown })],
  encapsulation: ViewEncapsulation.None,
  styles: [feedbackIconStyles],
  template: `
    <button
      hlmBtn
      type="button"
      variant="ghost"
      size="icon-xs"
      [class]="classes()"
      title="Thumbs down"
      aria-label="Thumbs down"
      [attr.aria-pressed]="active()"
      (click)="thumbsDown.emit()"
    >
      <ng-icon
        hlmIcon
        size="sm"
        name="lucideThumbsDown"
        [class.ai-message-actions-feedback-icon-active]="active()"
      />
    </button>
  `,
})
export class MessageActionsThumbsDown {
  public readonly active = input(false);
  public readonly thumbsDown = output<void>();

  protected readonly classes = computed(() => feedbackButtonClasses({ active: this.active() }));
}
