import { booleanAttribute, Component, computed, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCornerDownLeft, lucideLoaderCircle, lucideSquare, lucideX } from '@ng-icons/lucide';
import { twMerge } from 'tailwind-merge';
import type { PromptInputButtonVariants } from './prompt-input-button';
import { promptInputButtonVariants } from './prompt-input-button';
import { injectPromptInput } from './prompt-input-root';

@Component({
  selector: 'button[aiPromptInputSubmit],button[ai-prompt-input-submit]',
  imports: [NgIcon],
  providers: [provideIcons({ lucideCornerDownLeft, lucideLoaderCircle, lucideSquare, lucideX })],
  host: {
    '[class]': 'classes()',
    '[disabled]':
      'disabled() || promptInput.disabled() || (!isGenerating() && !promptInput.canSubmit())',
    '[attr.type]': 'buttonType()',
    '[attr.aria-label]': 'label()',
    '(click)': 'handleClick($event)',
  },
  template: `
    <ng-content>
      <ng-icon
        [name]="iconName()"
        style="--ng-icon__size: 16px"
        aria-hidden="true"
        [class.animate-spin]="spinning()"
      />
    </ng-content>
  `,
})
export class PromptInputSubmit {
  protected readonly promptInput = injectPromptInput();

  /** Disable this control. Root disabled state applies to all submission paths. */
  public readonly disabled = input(false, { transform: booleanAttribute });
  /** Visual size for the prompt input submit button. */
  public readonly size = input<PromptInputButtonVariants['size']>('icon-sm');
  /** Additional classes merged onto the prompt input submit button. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });
  /** Emits when the stop button is pressed while a response is in flight. */
  public readonly stop = output<void>();

  protected readonly effectiveStatus = computed(() => this.promptInput.status());
  protected readonly isGenerating = computed(
    () => this.effectiveStatus() === 'submitted' || this.effectiveStatus() === 'streaming',
  );
  protected readonly buttonType = computed(() => (this.isGenerating() ? 'button' : 'submit'));
  protected readonly label = computed(() =>
    this.isGenerating() ? 'Stop response' : 'Submit prompt',
  );
  protected readonly iconName = computed(() => {
    switch (this.effectiveStatus()) {
      case 'submitted':
        return 'lucideLoaderCircle';
      case 'streaming':
        return 'lucideSquare';
      case 'error':
        return 'lucideX';
      default:
        return 'lucideCornerDownLeft';
    }
  });
  protected readonly spinning = computed(() => this.effectiveStatus() === 'submitted');
  protected readonly classes = computed(() =>
    twMerge(promptInputButtonVariants({ size: this.size() }), this.userClass()),
  );

  protected handleClick(event: Event): void {
    if (!this.isGenerating()) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.stop.emit();
  }
}
