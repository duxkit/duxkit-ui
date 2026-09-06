import { booleanAttribute, computed, Directive, input } from '@angular/core';
import { injectReasoningEffort } from './reasoning-effort-root';
/** Bind this mapping to any Brain slider and compose its track, range, thumb and labels. */
@Directive({ selector: '[aiReasoningEffortSliderState]', exportAs: 'aiReasoningEffortSliderState' })
export class ReasoningEffortSliderState {
  public readonly reasoningEffort = injectReasoningEffort();
  /** Disable effort changes through this slider. */
  public readonly disabled = input(false, { transform: booleanAttribute });
  public readonly isDisabled = computed(() => this.disabled() || this.reasoningEffort.isDisabled());
  public readonly maxIndex = computed(() => Math.max(0, this.reasoningEffort.levels().length - 1));
  protected readonly selectedIndex = computed(() => {
    const selectedIndex = this.reasoningEffort
      .levels()
      .findIndex((level) => level.value === this.reasoningEffort.value());

    return selectedIndex === -1 ? undefined : selectedIndex;
  });
  protected readonly hasSelectedLevel = computed(() => this.selectedIndex() !== undefined);
  public readonly sliderValue = computed(() => {
    const selectedIndex = this.selectedIndex();

    return selectedIndex === undefined ? [] : [selectedIndex];
  });
  public selectSliderValue(values: readonly number[]): void {
    if (values[0] === undefined || !Number.isFinite(values[0])) return;
    const index = Math.round(values[0]);
    const level = this.reasoningEffort.levels()[index];

    if (!this.isDisabled() && level) {
      this.reasoningEffort.select(level.value);
    }
  }
}
