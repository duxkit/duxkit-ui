import { Directive, computed, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';

export const contextContentBodyClasses = 'grid w-full gap-1.5 px-4 py-3';

@Directive({
  selector: 'ai-context-content-body,[aiContextContentBody]',
  host: {
    '[class]': 'classes()',
  },
})
export class ContextContentBody {
  /** Additional classes merged onto the context content body. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() => twMerge(contextContentBodyClasses, this.userClass()));
}
