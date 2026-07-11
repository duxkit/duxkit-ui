import {
  AfterViewInit,
  Component,
  computed,
  contentChild,
  effect,
  ElementRef,
  input,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCircleCheck,
  lucideCircleDashed,
  lucideGlobe,
  lucideImage,
  lucideLoaderCircle,
  lucideSearch,
} from '@ng-icons/lucide';
import { twMerge } from 'tailwind-merge';
import { ChainOfThoughtStepIcon } from './chain-of-thought-step-icon';

export type ChainOfThoughtStepStatus = 'complete' | 'active' | 'pending';

const statusClasses: Record<ChainOfThoughtStepStatus, string> = {
  active: 'text-foreground',
  complete: 'text-muted-foreground',
  pending: 'text-muted-foreground/50',
};

const statusIcons: Record<ChainOfThoughtStepStatus, string> = {
  active: 'lucideLoaderCircle',
  complete: 'lucideCircleCheck',
  pending: 'lucideCircleDashed',
};

@Component({
  selector: '[aiChainOfThoughtStep],ai-chain-of-thought-step',
  imports: [NgIcon],
  providers: [
    provideIcons({
      lucideCircleCheck,
      lucideCircleDashed,
      lucideGlobe,
      lucideImage,
      lucideLoaderCircle,
      lucideSearch,
    }),
  ],
  host: {
    '[class]': 'classes()',
    '[attr.data-status]': 'status()',
  },
  template: `
    <div class="relative mt-0.5 shrink-0">
      <ng-content select="[aiChainOfThoughtStepIcon],ai-chain-of-thought-step-icon" />
      @if (stepIcon() === undefined) {
        <ng-icon
          [name]="defaultIcon()"
          style="--ng-icon__size: 16px"
          [class.animate-spin]="spinning()"
        />
      }
      <div class="absolute top-7 bottom-0 left-1/2 -mx-px w-px bg-border"></div>
    </div>

    <div class="min-w-0 flex-1 overflow-hidden">
      <div class="grid min-w-0 gap-2">
        <ng-content select="[aiChainOfThoughtStepLabel],ai-chain-of-thought-step-label" />
        <ng-content
          select="[aiChainOfThoughtStepDescription],ai-chain-of-thought-step-description"
        />

        <div class="relative min-w-0">
          <div
            #clampedContent
            class="min-w-0"
            [class.overflow-hidden]="isClamped()"
            [style.max-height]="contentMaxHeight()"
            [style.mask-image]="contentMaskImage()"
            [style.-webkit-mask-image]="contentMaskImage()"
          >
            <ng-content />
          </div>

          @if (showClampOverlay()) {
            <div
              class="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pt-12 pb-1"
            >
              <button
                type="button"
                class="pointer-events-auto rounded-md border border-border bg-background/90 px-2.5 py-1 font-medium text-muted-foreground text-xs shadow-sm transition-colors hover:text-foreground"
                (click)="expandContent()"
              >
                {{ showMoreLabel() }}
              </button>
            </div>
          }
        </div>
      </div>

      @if (showCollapseControl()) {
        <div class="mt-2 flex justify-center">
          <button
            type="button"
            class="rounded-md border border-border bg-background/90 px-2.5 py-1 font-medium text-muted-foreground text-xs shadow-sm transition-colors hover:text-foreground"
            (click)="collapseContent()"
          >
            {{ showLessLabel() }}
          </button>
        </div>
      }
    </div>
  `,
})
export class ChainOfThoughtStep implements AfterViewInit, OnDestroy {
  /** Visual status used to style the step marker. */
  public readonly status = input<ChainOfThoughtStepStatus>('complete');
  /** Maximum collapsed content height before the show more control appears. */
  public readonly collapsedMaxHeight = input<number | string | undefined>();
  /** Keeps step content scrolled to the bottom when new content is appended. */
  public readonly pinToBottom = input(false);
  /** Accessible label for the control that expands clipped step content. */
  public readonly showMoreLabel = input('Show more');
  /** Accessible label for the control that collapses clipped step content. */
  public readonly showLessLabel = input('Show less');
  /** Additional classes merged onto the step root element. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });
  private readonly clampedContent = viewChild<ElementRef<HTMLElement>>('clampedContent');
  protected readonly stepIcon = contentChild(ChainOfThoughtStepIcon);
  private resizeObserver: ResizeObserver | undefined;
  private mutationObserver: MutationObserver | undefined;

  protected readonly expanded = signal(false);
  protected readonly hasOverflow = signal(false);
  protected readonly defaultIcon = computed(() => statusIcons[this.status()]);
  protected readonly spinning = computed(() => this.defaultIcon() === 'lucideLoaderCircle');
  protected readonly isClamped = computed(
    () => this.collapsedMaxHeight() !== undefined && !this.expanded(),
  );
  protected readonly showClampOverlay = computed(() => this.isClamped() && this.hasOverflow());
  protected readonly showCollapseControl = computed(
    () => this.collapsedMaxHeight() !== undefined && this.expanded() && this.hasOverflow(),
  );
  protected readonly contentMaxHeight = computed(() => {
    if (!this.isClamped()) {
      return null;
    }

    return this.formatMaxHeight(this.collapsedMaxHeight());
  });
  protected readonly contentMaskImage = computed(() => {
    if (!this.showClampOverlay()) {
      return null;
    }

    return 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)';
  });

  protected readonly classes = computed(() =>
    twMerge(
      'flex gap-2 text-sm motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-2',
      statusClasses[this.status()],
      this.userClass(),
    ),
  );

  constructor() {
    effect(() => {
      this.collapsedMaxHeight();
      this.expanded();
      this.pinToBottom();

      queueMicrotask(() => this.syncClampState());
    });
  }

  ngAfterViewInit(): void {
    const content = this.clampedContent()?.nativeElement;

    if (content === undefined) {
      return;
    }

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.syncClampState());
      this.resizeObserver.observe(content);
    }

    if (typeof MutationObserver !== 'undefined') {
      this.mutationObserver = new MutationObserver(() => this.syncClampState());
      this.mutationObserver.observe(content, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    }

    queueMicrotask(() => this.syncClampState());
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.mutationObserver?.disconnect();
  }

  protected expandContent(): void {
    this.expanded.set(true);
  }

  protected collapseContent(): void {
    this.expanded.set(false);
  }

  private syncClampState(): void {
    const content = this.clampedContent()?.nativeElement;

    if (content === undefined || this.collapsedMaxHeight() === undefined) {
      this.hasOverflow.set(false);
      return;
    }

    const maxHeight = Number.parseFloat(this.formatMaxHeight(this.collapsedMaxHeight()) ?? '0');

    if (this.expanded()) {
      this.hasOverflow.set(content.scrollHeight > maxHeight + 1);
      return;
    }

    this.hasOverflow.set(content.scrollHeight > content.clientHeight + 1);

    if (this.pinToBottom() && this.isClamped()) {
      content.scrollTop = content.scrollHeight;
    }
  }

  private formatMaxHeight(value: number | string | undefined): string | null {
    if (value === undefined) {
      return null;
    }

    return typeof value === 'number' ? `${value}px` : value;
  }
}
