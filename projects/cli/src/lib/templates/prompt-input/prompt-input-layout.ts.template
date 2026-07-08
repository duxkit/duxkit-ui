import { computed, Directive, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';

@Directive({
  selector: '[aiPromptInputBody],ai-prompt-input-body',
  host: {
    '[class]': 'classes()',
  },
})
export class PromptInputBody {
  /** Additional classes merged onto the prompt input body. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() => twMerge('contents', this.userClass()));
}

@Directive({
  selector: '[aiPromptInputHeader],ai-prompt-input-header',
  host: {
    '[class]': 'classes()',
  },
})
export class PromptInputHeader {
  /** Additional classes merged onto the prompt input header. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() =>
    twMerge('order-first flex min-w-0 flex-wrap items-center gap-1 px-2 pt-2', this.userClass()),
  );
}

@Directive({
  selector: '[aiPromptInputToolbar],ai-prompt-input-toolbar',
  host: {
    '[class]': 'classes()',
  },
})
export class PromptInputToolbar {
  /** Additional classes merged onto the prompt input toolbar. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() =>
    twMerge('flex min-w-0 items-center justify-between gap-2 px-2 pb-2', this.userClass()),
  );
}

@Directive({
  selector: '[aiPromptInputTools],ai-prompt-input-tools',
  host: {
    '[class]': 'classes()',
    role: 'group',
    'aria-label': 'Prompt tools',
  },
})
export class PromptInputTools {
  /** Additional classes merged onto the prompt input tools group. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() =>
    twMerge('flex min-w-0 items-center gap-1', this.userClass()),
  );
}
