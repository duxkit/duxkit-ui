import { Component, computed, inject, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown } from '@ng-icons/lucide';
import { BrnCollapsible, BrnCollapsibleTrigger } from '@spartan-ng/brain/collapsible';
import { twMerge } from 'tailwind-merge';

@Component({
  selector: 'button[aiSourcesTrigger]',
  imports: [NgIcon],
  providers: [provideIcons({ lucideChevronDown })],
  hostDirectives: [{ directive: BrnCollapsibleTrigger, inputs: ['type'] }],
  host: {
    '[class]': 'classes()',
  },
  template: `
    <ng-content>
      <span class="font-medium">{{ triggerLabel() }}</span>
      <ng-icon
        name="lucideChevronDown"
        aria-hidden="true"
        class="transition-transform"
        style="--ng-icon__size: 16px"
        [class.rotate-180]="expanded()"
      />
    </ng-content>
  `,
})
export class SourcesTrigger {
  /** Number of sources referenced by the response. */
  public readonly count = input<number>(0);
  /** Additional classes merged onto the sources trigger button. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  private readonly collapsible = inject(BrnCollapsible);

  protected readonly expanded = this.collapsible.expanded;
  protected readonly triggerLabel = computed(() => `Used ${this.count()} sources`);
  protected readonly classes = computed(() => twMerge('flex items-center gap-2', this.userClass()));
}
