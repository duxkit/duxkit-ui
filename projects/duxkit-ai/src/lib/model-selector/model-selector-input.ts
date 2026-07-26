import { Component, computed, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSearch } from '@ng-icons/lucide';
import { BrnCommandInput, injectBrnCommand } from '@spartan-ng/brain/command';
import { twMerge } from 'tailwind-merge';

export const modelSelectorInputClasses =
  'flex h-auto items-center gap-2 border-b border-border px-3 py-3.5';

@Component({
  selector: 'ai-model-selector-input',
  imports: [ReactiveFormsModule, BrnCommandInput, NgIcon],
  providers: [provideIcons({ lucideSearch })],
  host: {
    'data-slot': 'model-selector-input-wrapper',
    '[class]': 'classes()',
  },
  template: `
    <ng-icon
      name="lucideSearch"
      class="shrink-0 text-muted-foreground"
      style="--ng-icon__size: 16px"
      aria-hidden="true"
    />
    <input
      brnCommandInput
      data-slot="model-selector-input"
      class="min-w-0 flex-1 bg-transparent text-foreground text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
      [id]="inputId()"
      [placeholder]="placeholder()"
      (keydown.enter)="selectActiveItem($event)"
    />
  `,
})
export class ModelSelectorInput {
  private readonly command = injectBrnCommand();

  /** Id applied to the underlying command search input. */
  public readonly inputId = input<string | undefined>();
  /** Placeholder text shown in the command search input. */
  public readonly placeholder = input<string>('');
  /** Additional classes merged onto the input wrapper. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() => twMerge(modelSelectorInputClasses, this.userClass()));

  protected selectActiveItem(event: Event): void {
    event.preventDefault();
    this.command.keyManager.activeItem?.selected.emit();
  }
}
