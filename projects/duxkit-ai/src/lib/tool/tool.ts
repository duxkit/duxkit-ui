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
      '[&_ai-confirmation]:rounded-b-lg [&_ai-confirmation]:rounded-t-none [&_ai-confirmation]:border-x-0 [&_ai-confirmation]:border-b-0 [&_ai-confirmation]:border-t [&_ai-confirmation]:border-border [&_ai-confirmation]:bg-background [&_ai-confirmation]:px-3 [&_ai-confirmation]:py-2 [&_ai-confirmation]:text-muted-foreground',
      '[&_[aiConfirmation]]:rounded-b-lg [&_[aiConfirmation]]:rounded-t-none [&_[aiConfirmation]]:border-x-0 [&_[aiConfirmation]]:border-b-0 [&_[aiConfirmation]]:border-t [&_[aiConfirmation]]:border-border [&_[aiConfirmation]]:bg-background [&_[aiConfirmation]]:px-3 [&_[aiConfirmation]]:py-2 [&_[aiConfirmation]]:text-muted-foreground',
      this.userClass(),
    ),
  );
}
