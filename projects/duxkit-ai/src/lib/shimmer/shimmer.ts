import {
  afterRenderEffect,
  AfterViewInit,
  computed,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  numberAttribute,
  signal,
} from '@angular/core';
import { twMerge } from 'tailwind-merge';

@Directive({
  selector: '[aiShimmer],ai-shimmer',
  host: {
    '[class]': 'classes()',
    '[style.--ai-shimmer-duration]': 'durationStyle()',
    '[style.--ai-shimmer-spread]': 'spreadStyle()',
    '[style.background-image]': 'reducedMotion() ? null : backgroundImage',
    '[style.background-size]': 'reducedMotion() ? null : "250% 100%, auto"',
    '[style.-webkit-text-fill-color]': 'reducedMotion() ? "currentColor" : "transparent"',
  },
})
export class Shimmer implements AfterViewInit {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly reducedMotion = signal(false);
  protected readonly backgroundImage =
    'linear-gradient(90deg, transparent calc(50% - var(--ai-shimmer-spread)), var(--background, Canvas), transparent calc(50% + var(--ai-shimmer-spread))), linear-gradient(var(--muted-foreground, currentColor), var(--muted-foreground, currentColor))';
  private animation: Animation | undefined;
  public constructor() {
    const media = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');
    const update = () => this.reducedMotion.set(media?.matches ?? false);
    update();
    media?.addEventListener('change', update);
    afterRenderEffect(() => {
      const duration = this.validNumber(this.duration(), 2);
      const reduced = this.reducedMotion();
      this.animation?.cancel();
      if (!reduced)
        this.animation = this.elementRef.nativeElement.animate?.(
          [{ backgroundPosition: '100% center' }, { backgroundPosition: '0% center' }],
          { duration: Math.max(0.01, duration) * 1000, iterations: Infinity },
        );
    });
    this.destroyRef.onDestroy(() => {
      this.animation?.cancel();
      media?.removeEventListener('change', update);
    });
  }
  private readonly textLength = signal(0);

  /** Animation duration in seconds. */
  public readonly duration = input(2, { transform: numberAttribute });
  /** Pixel multiplier used with text length to calculate shimmer spread. */
  public readonly spread = input(2, { transform: numberAttribute });
  /** Additional classes merged onto the shimmer element. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() =>
    twMerge(
      'ai-shimmer relative inline-block text-muted-foreground bg-clip-text',
      this.userClass(),
    ),
  );

  protected readonly durationStyle = computed(() => `${this.validNumber(this.duration(), 2)}s`);
  protected readonly spreadStyle = computed(() => {
    const spread = this.textLength() * this.validNumber(this.spread(), 2);

    return `${Math.max(0, spread)}px`;
  });

  ngAfterViewInit(): void {
    this.updateTextLength();

    if (typeof MutationObserver === 'undefined') {
      return;
    }

    const mutationObserver = new MutationObserver(() => this.updateTextLength());

    mutationObserver.observe(this.elementRef.nativeElement, {
      characterData: true,
      childList: true,
      subtree: true,
    });

    this.destroyRef.onDestroy(() => mutationObserver.disconnect());
  }

  private validNumber(value: number, fallback: number): number {
    return Number.isFinite(value) ? value : fallback;
  }

  private updateTextLength(): void {
    this.textLength.set(this.elementRef.nativeElement.textContent?.trim().length ?? 0);
  }
}
