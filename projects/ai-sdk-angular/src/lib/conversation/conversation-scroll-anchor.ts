import { Directive, ElementRef, inject } from '@angular/core';

@Directive({
  selector: '[aiConversationScrollAnchor]',
  exportAs: 'aiConversationAnchor',
})
export class ConversationScrollAnchor {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  scrollIntoView(options?: ScrollIntoViewOptions): void {
    this.elementRef.nativeElement.scrollIntoView({
      block: 'end',
      ...options,
    });
  }
}
