import { Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBook } from '@ng-icons/lucide';
import { twMerge } from 'tailwind-merge';

@Component({
  selector: 'a[aiSource]',
  imports: [NgIcon],
  providers: [provideIcons({ lucideBook })],
  host: {
    '[attr.href]': 'href()',
    '[attr.target]': 'target()',
    '[attr.rel]': 'rel()',
    '[attr.title]': 'title()',
    '[class]': 'classes()',
  },
  template: `
    <ng-content>
      <ng-icon name="lucideBook" aria-hidden="true" style="--ng-icon__size: 16px" />
      <span class="block font-medium">{{ title() }}</span>
    </ng-content>
  `,
})
export class Source {
  /** URL opened when the source link is activated. */
  public readonly href = input<string | undefined>();
  /** Accessible source title and default visible label. */
  public readonly title = input<string | undefined>();
  /** Anchor target for the source link. */
  public readonly target = input<string | undefined>('_blank');
  /** Relationship attribute for the source link. */
  public readonly rel = input<string | undefined>('noreferrer');
  /** Additional classes merged onto the source link. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() => twMerge('flex items-center gap-2', this.userClass()));
}
