import { Component, computed, input } from '@angular/core';
import { twMerge } from 'tailwind-merge';
import { injectContext } from './context-root';

const ICON_RADIUS = 10;
const ICON_VIEWBOX = 24;
const ICON_CENTER = 12;
const ICON_STROKE_WIDTH = 2;

export const contextIconClasses = 'inline-block shrink-0 text-current';

@Component({
  selector: 'ai-context-icon,[aiContextIcon]',
  host: {
    '[class]': 'classes()',
  },
  template: `
    <svg aria-label="Model context usage" height="20" role="img" viewBox="0 0 24 24" width="20">
      <circle
        [attr.cx]="iconCenter"
        [attr.cy]="iconCenter"
        fill="none"
        opacity="0.25"
        [attr.r]="iconRadius"
        stroke="currentColor"
        [attr.stroke-width]="iconStrokeWidth"
      />
      <circle
        [attr.cx]="iconCenter"
        [attr.cy]="iconCenter"
        fill="none"
        opacity="0.7"
        [attr.r]="iconRadius"
        stroke="currentColor"
        [attr.stroke-dasharray]="strokeDasharray()"
        [attr.stroke-dashoffset]="strokeDashoffset()"
        stroke-linecap="round"
        [attr.stroke-width]="iconStrokeWidth"
        style="transform: rotate(-90deg); transform-origin: center"
      />
    </svg>
  `,
})
export class ContextIcon {
  private readonly context = injectContext();

  /** Additional classes merged onto the context icon. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly iconRadius = ICON_RADIUS;
  protected readonly iconCenter = ICON_CENTER;
  protected readonly iconStrokeWidth = ICON_STROKE_WIDTH;
  protected readonly circumference = 2 * Math.PI * ICON_RADIUS;
  protected readonly strokeDasharray = computed(
    () => `${this.circumference} ${this.circumference}`,
  );
  protected readonly strokeDashoffset = computed(
    () => this.circumference * (1 - this.context.clampedUsedPercent()),
  );
  protected readonly classes = computed(() => twMerge(contextIconClasses, this.userClass()));
}
