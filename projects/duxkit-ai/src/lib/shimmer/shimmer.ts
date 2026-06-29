import {
  AfterViewInit,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  numberAttribute,
  signal,
} from '@angular/core';
import { twMerge } from 'tailwind-merge';

@Component({
  selector: '[aiShimmer],ai-shimmer',
  host: {
    '[class]': 'classes()',
    '[style.--ai-shimmer-duration]': 'durationStyle()',
    '[style.--ai-shimmer-spread]': 'spreadStyle()',
  },
  template: '<ng-content />',
  styles: `
    :host(.ai-shimmer) {
      animation: ai-shimmer-sweep var(--ai-shimmer-duration) linear infinite;
      background-image:
        linear-gradient(
          90deg,
          transparent calc(50% - var(--ai-shimmer-spread)),
          var(--background, Canvas),
          transparent calc(50% + var(--ai-shimmer-spread))
        ),
        linear-gradient(
          var(--muted-foreground, currentColor),
          var(--muted-foreground, currentColor)
        );
      background-repeat: no-repeat, no-repeat;
      background-size:
        250% 100%,
        auto;
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    @keyframes ai-shimmer-sweep {
      from {
        background-position: 100% center;
      }

      to {
        background-position: 0% center;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      :host(.ai-shimmer) {
        animation: none;
        background-image: none;
        color: var(--muted-foreground, currentColor);
        -webkit-text-fill-color: currentColor;
      }
    }
  `,
})
export class Shimmer implements AfterViewInit {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly textLength = signal(0);

  /** Animation duration in seconds. */
  public readonly duration = input(2, { transform: numberAttribute });
  /** Pixel multiplier used with text length to calculate shimmer spread. */
  public readonly spread = input(2, { transform: numberAttribute });
  /** Additional classes merged onto the shimmer element. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly classes = computed(() =>
    twMerge('ai-shimmer relative inline-block text-transparent bg-clip-text', this.userClass()),
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
