import { Component, computed, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';
import { injectContext } from './context-root';

export const contextContentHeaderClasses = 'block w-full space-y-3 p-4';

@Component({
  selector: 'ai-context-content-header,[aiContextContentHeader]',
  host: {
    '[class]': 'classes()',
  },
  template: `
    <ng-content>
      <div class="flex items-center justify-between gap-4 text-xs">
        <p class="m-0">{{ context.renderedPercent() }}</p>
        <p class="m-0 whitespace-nowrap font-mono text-muted-foreground">
          {{ context.renderedTokens() }}
        </p>
      </div>
      <div
        aria-label="Context window usage"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        [attr.aria-valuenow]="context.progressValue()"
        class="h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          class="h-full bg-primary transition-[width]"
          [style.width.%]="context.progressValue()"
        ></div>
      </div>
    </ng-content>
  `,
})
export class ContextContentHeader {
  protected readonly context = injectContext();

  /** Additional classes merged onto the context content header. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() =>
    twMerge(contextContentHeaderClasses, this.userClass()),
  );
}
