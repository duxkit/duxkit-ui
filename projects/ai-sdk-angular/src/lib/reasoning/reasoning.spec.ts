import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Reasoning } from './reasoning';

@Component({
  imports: [Reasoning],
  template: '<ai-reasoning [isStreaming]="isStreaming()"></ai-reasoning>',
})
class Host {
  readonly isStreaming = signal(false);
  readonly reasoning = viewChild.required(Reasoning);
}

describe('Reasoning', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('tracks the completed reasoning duration from streaming transitions', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000);

    fixture.componentInstance.isStreaming.set(true);
    fixture.detectChanges();

    expect(fixture.componentInstance.reasoning().durationSeconds()).toBeUndefined();

    vi.setSystemTime(6_500);
    fixture.componentInstance.isStreaming.set(false);
    fixture.detectChanges();

    expect(fixture.componentInstance.reasoning().durationSeconds()).toBe(6);
  });
});
