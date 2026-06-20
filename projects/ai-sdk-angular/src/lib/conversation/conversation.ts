import { Directive, input } from '@angular/core';

@Directive({
  selector: 'ai-conversation,[aiConversation]',
  host: {
    '[class]': 'userClass() + " w-full h-full flex flex-col"',
  },
})
export class Conversation {
  public readonly stickToBottom = input<'auto' | boolean>('auto');
  public readonly userClass = input<string | undefined>(undefined, { alias: 'class' });

  constructor() {}
}
