import { Component, computed, input } from '@angular/core';
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
    <img [alt]="computedAlt()" [class]="classes()" height="12" [src]="src()" width="12" />
  `,
})
export class ModelSelectorLogo {
  /** Provider slug used to resolve the models.dev logo. */
  public readonly provider = input.required<ModelSelectorProvider>();
  /** Accessible logo alt text. Defaults to "<provider> logo". */
  public readonly alt = input<string | undefined>(undefined);
  /** Additional classes merged onto the logo image. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly src = computed(() => `https://models.dev/logos/${this.provider()}.svg`);
  protected readonly computedAlt = computed(() => this.alt() ?? `${this.provider()} logo`);
  protected readonly classes = computed(() => twMerge(modelSelectorLogoClasses, this.userClass()));
}
