import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Conversation } from './conversation';

@Component({
  imports: [Conversation],
  template: '<ai-conversation class="h-auto block custom-conversation" />',
})
class Host {
  readonly conversation = viewChild.required(Conversation);
}

describe('Conversation', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('matches element usage', () => {
    expect(fixture.componentInstance.conversation()).toBeTruthy();
  });

  it('lets consumer classes override conflicting default layout classes', () => {
    const element = fixture.nativeElement.querySelector('ai-conversation') as HTMLElement;

    expect(element.classList).toContain('w-full');
    expect(element.classList).toContain('flex-col');
    expect(element.classList).toContain('h-auto');
    expect(element.classList).toContain('block');
    expect(element.classList).toContain('custom-conversation');
    expect(element.classList).not.toContain('h-full');
    expect(element.classList).not.toContain('flex');
  });
});
