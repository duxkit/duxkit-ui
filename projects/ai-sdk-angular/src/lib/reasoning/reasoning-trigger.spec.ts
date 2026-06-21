import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Reasoning } from './reasoning';
import { ReasoningTrigger } from './reasoning-trigger';

@Component({
  imports: [Reasoning, ReasoningTrigger],
  template: `
    <ai-reasoning [isStreaming]="isStreaming()">
      <button aiReasoningTrigger></button>
    </ai-reasoning>
  `,
})
class Host {
  readonly isStreaming = signal(false);
}

describe('ReasoningTrigger', () => {
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

  it('renders the completed reasoning duration in the default label', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000);

    fixture.componentInstance.isStreaming.set(true);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Thinking...');

    vi.setSystemTime(62_000);
    fixture.componentInstance.isStreaming.set(false);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Thought for 1 minute');
  });
});
