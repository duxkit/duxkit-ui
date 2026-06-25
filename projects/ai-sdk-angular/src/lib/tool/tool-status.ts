import { Component, computed, inject, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideAlertCircle,
  lucideCircleCheck,
  lucideCircleDashed,
  lucideCircleX,
} from '@ng-icons/lucide';
import { HlmIcon } from 'ai-sdk-angular/helm/icon';
import { twMerge } from 'tailwind-merge';
import { Tool } from './tool';

export type ToolStatusVariant = 'badge' | 'icon';

@Component({
  selector: '[aiToolStatus],ai-tool-status',
  imports: [HlmIcon, NgIcon],
  providers: [
    provideIcons({
      lucideAlertCircle,
      lucideCircleCheck,
      lucideCircleDashed,
      lucideCircleX,
    }),
  ],
  host: {
    '[class]': 'classes()',
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.title]': 'ariaLabel()',
    '[attr.data-variant]': 'variant()',
    '[attr.data-tool-state]': 'tool.state()',
  },
  template: `
    @if (variant() === 'icon') {
      <ng-icon hlm size="sm" [name]="iconName()" />
    } @else {
      {{ tool.statusLabel() }}
    }
  `,
})
export class ToolStatus {
  protected readonly tool = inject(Tool);

  public readonly variant = input<ToolStatusVariant>('badge');
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  protected readonly ariaLabel = computed(() => `Tool status: ${this.tool.statusLabel()}`);
  protected readonly iconName = computed(() => {
    switch (this.tool.state()) {
      case 'approval-requested':
        return 'lucideAlertCircle';
      case 'output-available':
        return 'lucideCircleCheck';
      case 'output-error':
        return 'lucideCircleX';
      default:
        return 'lucideCircleDashed';
    }
  });

  protected readonly classes = computed(() =>
    twMerge(
      this.variant() === 'icon'
        ? 'inline-flex shrink-0 items-center justify-center text-muted-foreground'
        : 'inline-flex shrink-0 items-center rounded border border-border px-1.5 py-0.5 text-xs text-muted-foreground',
      this.userClass(),
    ),
  );
}
