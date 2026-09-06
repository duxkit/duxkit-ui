import {
  afterRenderEffect,
  booleanAttribute,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { BrnSliderImports } from '@spartan-ng/brain/slider';
import { twMerge } from 'tailwind-merge';
import { ReasoningEffortSliderState } from './reasoning-effort-slider-state';

export const reasoningEffortSliderClasses =
  'relative flex w-full touch-none items-center select-none data-disabled:pointer-events-none data-disabled:opacity-50';
export const reasoningEffortSliderTrackClasses =
  'relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted';
export const reasoningEffortSliderRangeClasses = 'absolute h-full bg-primary';
export const reasoningEffortSliderThumbClasses =
  'absolute block size-4 rounded-full border-2 border-primary bg-background shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-disabled:pointer-events-none data-disabled:opacity-50';

@Component({
  exportAs: 'aiReasoningEffortSlider',
  selector: 'ai-reasoning-effort-slider,[aiReasoningEffortSlider]',
  imports: [BrnSliderImports],
  host: {
    'data-slot': 'reasoning-effort-slider-root',
    '[class]': 'classes()',
  },
  template: `<ng-content>
    @if (hasSelectedLevel()) {
      <div
        brnSlider
        data-slot="reasoning-effort-slider"
        [aria-label]="ariaLabel() ?? reasoningEffort.label()"
        [class]="computedSliderClass()"
        [disabled]="isDisabled()"
        [max]="maxIndex()"
        [min]="0"
        [step]="1"
        [orientation]="orientation()"
        [value]="sliderValue()"
        (valueChange)="selectSliderValue($event)"
      >
        <div brnSliderTrack [class]="computedTrackClass()">
          <div brnSliderRange [class]="computedRangeClass()"></div>
        </div>
        <span
          #thumb
          brnSliderThumb
          [attr.aria-valuetext]="reasoningEffort.selectedLabel()"
          [class]="computedThumbClass()"
        ></span>
      </div>

      @if (showLabels()) {
        <div
          aria-hidden="true"
          data-slot="reasoning-effort-slider-labels"
          [class]="computedLabelsClass()"
          [style.padding-inline.px]="orientation() === 'horizontal' ? labelsInset() : 0"
          [style.padding-block.px]="orientation() === 'vertical' ? labelsInset() : 0"
        >
          @for (level of reasoningEffort.levels(); track level.value) {
            <span
              data-slot="reasoning-effort-slider-label-stop"
              [class]="
                orientation() === 'horizontal'
                  ? 'flex w-0 shrink-0 justify-center'
                  : 'flex h-0 shrink-0 items-center'
              "
            >
              <span
                [class]="computedLevelLabelClass()"
                [class.font-medium]="level.value === reasoningEffort.selectedLevel()?.value"
                [class.text-foreground]="level.value === reasoningEffort.selectedLevel()?.value"
                [attr.title]="level.label"
              >
                {{ level.label }}
              </span>
            </span>
          }
        </div>
      }
    }
  </ng-content>`,
})
export class ReasoningEffortSlider extends ReasoningEffortSliderState {
  private readonly destroyRef = inject(DestroyRef);
  private readonly thumbElement = viewChild<ElementRef<HTMLElement>>('thumb');
  private readonly thumbWidth = signal(16);
  private observedThumb: HTMLElement | undefined;
  private readonly resizeObserver =
    typeof ResizeObserver === 'undefined'
      ? undefined
      : new ResizeObserver(() => this.measureThumb());

  /** Direction of the default slider. */
  public readonly orientation = input<'horizontal' | 'vertical'>('horizontal');
  /** Accessible label for the slider. Defaults to the root label. */
  public readonly ariaLabel = input<string | undefined>(undefined);
  /** Whether labels for every configured level are rendered below the track. */
  public readonly showLabels = input(true, { transform: booleanAttribute });
  /** Additional classes merged onto the slider component host. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });
  /** Additional classes merged onto the Brain slider element. */
  public readonly sliderClass = input<string | undefined>(undefined);
  /** Additional classes merged onto the slider track. */
  public readonly trackClass = input<string | undefined>(undefined);
  /** Additional classes merged onto the slider range. */
  public readonly rangeClass = input<string | undefined>(undefined);
  /** Additional classes merged onto the slider thumb. */
  public readonly thumbClass = input<string | undefined>(undefined);
  /** Additional classes merged onto the level-label row. */
  public readonly labelsClass = input<string | undefined>(undefined);
  /** Additional classes applied to each level label. */
  public readonly levelLabelClass = input<string | undefined>(undefined);

  protected readonly labelsInset = computed(() => this.thumbWidth() / 2);
  protected readonly classes = computed(() =>
    twMerge(
      'flex w-full flex-col gap-3',
      this.orientation() === 'vertical' && 'h-48 w-fit flex-row',
      this.userClass(),
    ),
  );
  protected readonly computedSliderClass = computed(() =>
    twMerge(
      reasoningEffortSliderClasses,
      this.orientation() === 'vertical' && 'h-48 w-5 flex-col',
      this.sliderClass(),
    ),
  );
  protected readonly computedTrackClass = computed(() =>
    twMerge(
      reasoningEffortSliderTrackClasses,
      this.orientation() === 'vertical' && 'h-full w-1.5',
      this.trackClass(),
    ),
  );
  protected readonly computedRangeClass = computed(() =>
    twMerge(
      reasoningEffortSliderRangeClasses,
      this.orientation() === 'vertical' && 'w-full h-auto',
      this.rangeClass(),
    ),
  );
  protected readonly computedThumbClass = computed(() =>
    twMerge(reasoningEffortSliderThumbClasses, this.thumbClass()),
  );
  protected readonly computedLabelsClass = computed(() =>
    twMerge(
      'flex items-start justify-between',
      this.orientation() === 'vertical' && 'h-full flex-col-reverse',
      this.labelsClass(),
    ),
  );
  protected readonly computedLevelLabelClass = computed(() =>
    twMerge(
      'max-w-24 shrink-0 truncate text-center text-xs text-muted-foreground',
      this.levelLabelClass(),
    ),
  );

  public constructor() {
    super();
    afterRenderEffect(() => {
      const thumb = this.thumbElement()?.nativeElement;

      if (thumb === this.observedThumb) {
        return;
      }

      if (this.observedThumb) {
        this.resizeObserver?.unobserve(this.observedThumb);
      }

      this.observedThumb = thumb;

      if (thumb) {
        this.resizeObserver?.observe(thumb);
        this.measureThumb();
      }
    });

    this.destroyRef.onDestroy(() => this.resizeObserver?.disconnect());
  }

  private measureThumb(): void {
    const width = this.observedThumb?.getBoundingClientRect().width ?? 0;

    if (width > 0 && width !== this.thumbWidth()) {
      this.thumbWidth.set(width);
    }
  }
}
