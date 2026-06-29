import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Reasoning } from './reasoning';
import { ReasoningContent } from './reasoning-content';
import { ReasoningTrigger } from './reasoning-trigger';

@Component({
  imports: [Reasoning],
  template: '<ai-reasoning [isStreaming]="isStreaming()"></ai-reasoning>',
})
class Host {
  readonly isStreaming = signal(false);
  readonly reasoning = viewChild.required(Reasoning);
}

@Component({
  imports: [Reasoning, ReasoningContent, ReasoningTrigger],
  template: `
    <ai-reasoning [isStreaming]="false" [expanded]="true">
      <button aiReasoningTrigger></button>
      <ai-reasoning-content>Reasoning text</ai-reasoning-content>
    </ai-reasoning>
  `,
})
class ExpandedHost {}

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

  it('preserves an explicit expanded state while not streaming', async () => {
    await TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [ExpandedHost],
      })
      .compileComponents();

    const expandedFixture = TestBed.createComponent(ExpandedHost);
    expandedFixture.detectChanges();
    await expandedFixture.whenStable();

    const element = expandedFixture.nativeElement as HTMLElement;
    const reasoning = element.querySelector('ai-reasoning');
    const trigger = element.querySelector('button[aiReasoningTrigger]');
    const content = element.querySelector('ai-reasoning-content');

    expect(reasoning?.getAttribute('data-state')).toBe('open');
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');
    expect(content?.getAttribute('data-state')).toBe('open');
  });
});
