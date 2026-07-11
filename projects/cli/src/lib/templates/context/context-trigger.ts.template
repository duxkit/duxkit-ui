import { Component, computed, effect, ElementRef, inject, input } from '@angular/core';
import { BrnHoverCardTrigger } from '@spartan-ng/brain/hover-card';
import { twMerge } from 'tailwind-merge';
import { ContextIcon } from './context-icon';
import { injectContext } from './context-root';

export const contextTriggerClasses =
  'inline-flex min-w-0 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md border-0 bg-transparent px-2 py-1 font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';

@Component({
  selector: 'button[aiContextTrigger],ai-context-trigger',
  imports: [ContextIcon],
  hostDirectives: [
    {
      directive: BrnHoverCardTrigger,
      inputs: ['align', 'animationDelay', 'hideDelay', 'showDelay', 'sideOffset'],
    },
  ],
  host: {
    '[class]': 'classes()',
    '[attr.type]': 'buttonType()',
    '[attr.role]': 'customRole()',
    '[attr.tabindex]': 'customTabIndex()',
    '[attr.brnHoverCardTrigger]': "''",
  },
  template: `
    <ng-content>
      <span>{{ context.renderedPercent() }}</span>
      <ai-context-icon />
    </ng-content>
  `,
})
export class ContextTrigger {
  protected readonly context = injectContext();
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly hoverCardTrigger = inject(BrnHoverCardTrigger);

  /** Additional classes merged onto the context trigger. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly isNativeButton = computed(
    () => this.elementRef.nativeElement.tagName.toLowerCase() === 'button',
  );
  protected readonly buttonType = computed(() => (this.isNativeButton() ? 'button' : null));
  protected readonly customRole = computed(() => (this.isNativeButton() ? null : 'button'));
  protected readonly customTabIndex = computed(() => (this.isNativeButton() ? null : '0'));
  protected readonly classes = computed(() => twMerge(contextTriggerClasses, this.userClass()));

  public constructor() {
    effect(() => {
      const hoverCardContent = this.context.content()?.hoverCardContent();

      if (hoverCardContent) {
        this.hoverCardTrigger.mutableBrnHoverCardTriggerFor().set(hoverCardContent);
      }
    });
  }
}
