import { computed, Directive, input } from '@angular/core';
import { BrnCollapsible } from '@spartan-ng/brain/collapsible';
import { getToolName, type DynamicToolUIPart, type ToolUIPart } from 'ai';
import { twMerge } from 'tailwind-merge';

export type AiToolPart = ToolUIPart | DynamicToolUIPart;

@Directive({
  selector: '[aiTool],ai-tool',
  hostDirectives: [
    {
      directive: BrnCollapsible,
      inputs: ['expanded', 'disabled'],
      outputs: ['expandedChange'],
    },
  ],
  host: {
    '[class]': 'classes()',
    '[attr.data-tool-name]': 'name()',
    '[attr.data-tool-state]': 'state()',
  },
})
export class Tool {
  /** AI SDK tool part used to derive the tool name, state, and JSON payload. */
  public readonly part = input.required<AiToolPart>();
  /** Additional classes merged onto the tool root element. */
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  public readonly name = computed(() => getToolName(this.part()));
  public readonly state = computed(() => this.part().state);
  public readonly json = computed(() => JSON.stringify(this.part(), null, 2));
  public readonly statusLabel = computed(() => this.state().replaceAll('-', ' '));

  protected readonly classes = computed(() =>
    twMerge(
      'my-2 flex w-full max-w-full min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-background',
      this.userClass(),
    ),
  );
}
