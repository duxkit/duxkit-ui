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
import { injectReasoningEffort } from './reasoning-effort-root';

export const reasoningEffortSliderClasses =
  'relative flex w-full touch-none items-center select-none data-disabled:pointer-events-none data-disabled:opacity-50';
export const reasoningEffortSliderTrackClasses =
  'relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted';
export const reasoningEffortSliderRangeClasses = 'absolute h-full bg-primary';
export const reasoningEffortSliderThumbClasses =
  'absolute block size-4 rounded-full border-2 border-primary bg-background shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-disabled:pointer-events-none data-disabled:opacity-50';

@Component({
  selector: 'ai-reasoning-effort-slider,[aiReasoningEffortSlider]',
  imports: [BrnSliderImports],
  host: {
    'data-slot': 'reasoning-effort-slider-root',
    '[class]': 'classes()',
  },
  template: `
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
          [style.padding-inline.px]="labelsInset()"
        >
          @for (level of reasoningEffort.levels(); track level.value) {
            <span
              data-slot="reasoning-effort-slider-label-stop"
              class="flex w-0 shrink-0 justify-center"
              style="width: 0"
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
  `,
})
export class ReasoningEffortSlider {
  protected readonly reasoningEffort = injectReasoningEffort();
  private readonly destroyRef = inject(DestroyRef);
  private readonly thumbElement = viewChild<ElementRef<HTMLElement>>('thumb');
  private readonly thumbWidth = signal(16);
  private observedThumb: HTMLElement | undefined;
  private readonly resizeObserver =
    typeof ResizeObserver === 'undefined'
      ? undefined
      : new ResizeObserver(() => this.measureThumb());

  /** Accessible label for the slider. Defaults to the root label. */
  public readonly ariaLabel = input<string | undefined>(undefined);
  /** Whether this slider alone is disabled. */
  public readonly disabled = input(false, { transform: booleanAttribute });
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

  protected readonly maxIndex = computed(() =>
    Math.max(0, this.reasoningEffort.levels().length - 1),
  );
  protected readonly selectedIndex = computed(() => {
    const selectedIndex = this.reasoningEffort
      .levels()
      .findIndex((level) => level.value === this.reasoningEffort.value());

    return selectedIndex === -1 ? undefined : selectedIndex;
  });
  protected readonly hasSelectedLevel = computed(() => this.selectedIndex() !== undefined);
  protected readonly sliderValue = computed(() => {
    const selectedIndex = this.selectedIndex();

    return selectedIndex === undefined ? [] : [selectedIndex];
  });
  protected readonly labelsInset = computed(() => this.thumbWidth() / 2);
  protected readonly isDisabled = computed(
    () => this.disabled() || this.reasoningEffort.isDisabled(),
  );
  protected readonly classes = computed(() =>
    twMerge('flex w-full flex-col gap-3', this.userClass()),
  );
  protected readonly computedSliderClass = computed(() =>
    twMerge(reasoningEffortSliderClasses, this.sliderClass()),
  );
  protected readonly computedTrackClass = computed(() =>
    twMerge(reasoningEffortSliderTrackClasses, this.trackClass()),
  );
  protected readonly computedRangeClass = computed(() =>
    twMerge(reasoningEffortSliderRangeClasses, this.rangeClass()),
  );
  protected readonly computedThumbClass = computed(() =>
    twMerge(reasoningEffortSliderThumbClasses, this.thumbClass()),
  );
  protected readonly computedLabelsClass = computed(() =>
    twMerge('flex items-start justify-between', this.labelsClass()),
  );
  protected readonly computedLevelLabelClass = computed(() =>
    twMerge(
      'max-w-24 shrink-0 truncate text-center text-xs text-muted-foreground',
      this.levelLabelClass(),
    ),
  );

  public constructor() {
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

  protected selectSliderValue(values: readonly number[]): void {
    const index = Math.round(values[0] ?? 0);
    const level = this.reasoningEffort.levels()[index];

    if (!this.disabled() && level) {
      this.reasoningEffort.select(level.value);
    }
  }

  private measureThumb(): void {
    const width = this.observedThumb?.getBoundingClientRect().width ?? 0;

    if (width > 0 && width !== this.thumbWidth()) {
      this.thumbWidth.set(width);
    }
  }
}
