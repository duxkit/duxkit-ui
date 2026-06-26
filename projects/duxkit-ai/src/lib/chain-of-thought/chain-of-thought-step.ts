import {
  AfterViewInit,
  Component,
  computed,
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
  lucideDot,
  lucideGlobe,
  lucideImage,
  lucideLoaderCircle,
  lucideSearch,
} from '@ng-icons/lucide';
import { HlmIcon } from 'duxkit-ai/helm/icon';
import { twMerge } from 'tailwind-merge';

export type ChainOfThoughtStepStatus = 'complete' | 'active' | 'pending';

const statusClasses: Record<ChainOfThoughtStepStatus, string> = {
  active: 'text-foreground',
  complete: 'text-muted-foreground',
  pending: 'text-muted-foreground/50',
};

@Component({
  selector: '[aiChainOfThoughtStep],ai-chain-of-thought-step',
  imports: [HlmIcon, NgIcon],
  providers: [
    provideIcons({
      lucideCircleCheck,
      lucideCircleDashed,
      lucideDot,
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
      <ng-icon hlm size="sm" [name]="icon()" [class.animate-spin]="spinning()" />
      <div class="absolute top-7 bottom-0 left-1/2 -mx-px w-px bg-border"></div>
    </div>

    <div class="min-w-0 flex-1 space-y-2 overflow-hidden">
      @if (label() !== undefined) {
        <div>{{ label() }}</div>
      }

      @if (description() !== undefined) {
        <div class="text-muted-foreground text-xs">{{ description() }}</div>
      }

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
          <div class="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pt-12 pb-1">
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
  public readonly icon = input('lucideDot');
  public readonly label = input<string | undefined>();
  public readonly description = input<string | undefined>();
  public readonly status = input<ChainOfThoughtStepStatus>('complete');
  public readonly collapsedMaxHeight = input<number | string | undefined>();
  public readonly pinToBottom = input(false);
  public readonly showMoreLabel = input('Show more');
  public readonly showLessLabel = input('Show less');
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });
  private readonly clampedContent = viewChild<ElementRef<HTMLElement>>('clampedContent');
  private resizeObserver: ResizeObserver | undefined;
  private mutationObserver: MutationObserver | undefined;

  protected readonly expanded = signal(false);
  protected readonly hasOverflow = signal(false);
  protected readonly spinning = computed(() => this.icon() === 'lucideLoaderCircle');
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

    if (this.pinToBottom()) {
      return 'linear-gradient(to bottom, transparent, black 3rem)';
    }

    return 'linear-gradient(to bottom, black calc(100% - 3rem), transparent)';
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
