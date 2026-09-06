import {
  afterRenderEffect,
  computed,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';

/** Shared clipping behavior; components supply a #clampedContent measurement target. */
@Directive({})
export class ContentClamp {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly clampedContent = viewChild<ElementRef<HTMLElement>>('clampedContent');
  private observedContent: HTMLElement | undefined;
  private resizeObserver: ResizeObserver | undefined;
  private mutationObserver: MutationObserver | undefined;

  /** Maximum collapsed height, in pixels or a CSS length. */
  public readonly collapsedMaxHeight = input<number | string | undefined>();
  /** Pin clipped content to the latest appended text. */
  public readonly pinToBottom = input(false);
  /** Show built-in controls. Disable when providing controls elsewhere. */
  public readonly showControls = input(true);
  /** Controlled expansion of clipped content. */
  public readonly expanded = model(false);
  private readonly overflow = signal(false);
  public readonly hasOverflow = this.overflow.asReadonly();
  public readonly isClamped = computed(
    () => this.collapsedMaxHeight() !== undefined && !this.expanded(),
  );
  public readonly showClampOverlay = computed(() => this.isClamped() && this.hasOverflow());
  public readonly showCollapseControl = computed(
    () => this.collapsedMaxHeight() !== undefined && this.expanded() && this.hasOverflow(),
  );
  public readonly contentMaxHeight = computed(() =>
    this.isClamped() ? this.formattedHeight() : null,
  );
  public readonly contentMaskImage = computed(() =>
    this.showClampOverlay()
      ? 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)'
      : null,
  );
  private readonly formattedHeight = computed(() => {
    const height = this.collapsedMaxHeight();
    return height === undefined ? null : typeof height === 'number' ? `${height}px` : height;
  });

  public constructor() {
    afterRenderEffect(() => {
      this.expanded();
      this.collapsedMaxHeight();
      this.pinToBottom();
      const content = this.clampedContent()?.nativeElement ?? this.elementRef.nativeElement;
      if (content !== this.observedContent) {
        this.disconnect();
        this.observedContent = content;
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
      }
      this.syncClampState();
    });
    this.destroyRef.onDestroy(() => this.disconnect());
  }

  public expandContent(): void {
    this.expanded.set(true);
  }
  public collapseContent(): void {
    this.expanded.set(false);
  }

  private syncClampState(): void {
    if (this.destroyRef.destroyed) return;
    const content = this.observedContent;
    const height = this.formattedHeight();
    if (!content || height === null) {
      this.overflow.set(false);
      return;
    }
    if (this.expanded()) {
      // Measure the actual CSS length, including rem, percentages and calc(), without guessing units.
      const previousHeight = content.style.maxHeight;
      content.style.maxHeight = height;
      this.overflow.set(content.scrollHeight > content.clientHeight + 1);
      content.style.maxHeight = previousHeight;
    } else {
      this.overflow.set(content.scrollHeight > content.clientHeight + 1);
      if (this.pinToBottom()) content.scrollTop = content.scrollHeight;
    }
  }

  private disconnect(): void {
    this.resizeObserver?.disconnect();
    this.mutationObserver?.disconnect();
  }
}

@Directive({
  selector: '[aiContentClamp]',
  exportAs: 'aiContentClamp',
  host: {
    '[style.max-height]': 'contentMaxHeight()',
    '[style.overflow]': 'isClamped() ? "hidden" : null',
  },
})
export class ContentClampDirective extends ContentClamp {}
