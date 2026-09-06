import { Component, computed, effect, input, signal } from '@angular/core';
import { twMerge } from 'tailwind-merge';
import type { ModelSelectorProvider } from './model-selector.types';

export const modelSelectorLogoClasses = 'size-3 dark:invert in-data-[theme=dark]:invert';

@Component({
  selector: 'ai-model-selector-logo',
  host: {
    'data-slot': 'model-selector-logo',
    class: 'contents',
  },
  template: `
    @if (failed() || !resolvedSrc()) {
      <ng-content>{{ provider() ?? 'Model' }}</ng-content>
    } @else {
      <img
        [alt]="computedAlt()"
        [class]="classes()"
        height="12"
        [src]="resolvedSrc()"
        width="12"
        (error)="failed.set(true)"
      />
    }
  `,
})
export class ModelSelectorLogo {
  /** Provider slug used to resolve the models.dev logo. */
  public readonly provider = input<ModelSelectorProvider>();
  /** Accessible logo alt text. Defaults to "<provider> logo". */
  public readonly alt = input<string | undefined>(undefined);
  /** Additional classes merged onto the logo image. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  /** Custom logo URL. */
  public readonly src = input<string>();
  protected readonly failed = signal(false);
  protected readonly resolvedSrc = computed(
    () =>
      this.src() ??
      (this.provider() ? `https://models.dev/logos/${this.provider()}.svg` : undefined),
  );
  public constructor() {
    effect(() => {
      this.resolvedSrc();
      this.failed.set(false);
    });
  }
  protected readonly computedAlt = computed(() => this.alt() ?? `${this.provider()} logo`);
  protected readonly classes = computed(() => twMerge(modelSelectorLogoClasses, this.userClass()));
}
