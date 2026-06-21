import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConversationScrollAnchor } from './conversation-scroll-anchor';

@Component({
  imports: [ConversationScrollAnchor],
  template: '<div aiConversationScrollAnchor></div>',
})
class Host {
  readonly anchor = viewChild.required(ConversationScrollAnchor);
}

describe('ConversationScrollAnchor', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('matches attribute usage', () => {
    expect(fixture.componentInstance.anchor()).toBeTruthy();
  });
});
