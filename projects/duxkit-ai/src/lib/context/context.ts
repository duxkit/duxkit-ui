import { Directive, forwardRef } from '@angular/core';
import { BrnHoverCard, provideBrnHoverCardDefaultOptions } from '@spartan-ng/brain/hover-card';
import { ContextData } from './context-data';
export { contextClasses, formatContextPercent, formatContextTokens } from './context-data';
export type { ContextModelId, ContextUsage } from './context-data';
@Directive({
  selector: 'ai-context,[aiContext]',
  hostDirectives: [BrnHoverCard],
  providers: [
    { provide: ContextData, useExisting: forwardRef(() => Context) },
    provideBrnHoverCardDefaultOptions({ animationDelay: 0, hideDelay: 0, showDelay: 0 }),
  ],
  host: { '[class]': 'classes()' },
})
export class Context extends ContextData {}
