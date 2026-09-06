import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Shimmer } from './shimmer';

@Component({
  imports: [Shimmer],
  template: `
    <p aiShimmer [duration]="duration()" [spread]="spread()" class="custom-shimmer">
      {{ text() }}
    </p>
    <ai-shimmer class="element-shimmer">Element shimmer</ai-shimmer>
  `,
})
class Host {
  readonly duration = signal(1.5);
  readonly spread = signal(3);
  readonly text = signal('Loading');
}

describe('Shimmer', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('supports attribute and element selectors while preserving consumer classes', () => {
    const element = fixture.nativeElement as HTMLElement;
    const paragraph = element.querySelector('p[aiShimmer]');
    const customElement = element.querySelector('ai-shimmer');

    expect(paragraph?.classList).toContain('ai-shimmer');
    expect(paragraph?.classList).toContain('custom-shimmer');
    expect(paragraph?.getAttribute('aria-hidden')).toBeNull();
    expect(customElement?.classList).toContain('ai-shimmer');
    expect(customElement?.classList).toContain('element-shimmer');
  });

  it('sets animation and spread CSS variables from inputs and text content', async () => {
    const element = fixture.nativeElement as HTMLElement;
    const paragraph = element.querySelector<HTMLElement>('p[aiShimmer]');

    await Promise.resolve();
    fixture.detectChanges();

    expect(paragraph?.style.getPropertyValue('--ai-shimmer-duration')).toBe('1.5s');
    expect(paragraph?.style.getPropertyValue('--ai-shimmer-spread')).toBe('21px');
  });

  it('uses the repo theme variables so transparent text still has a valid background', () => {
    const styles =
      (fixture.nativeElement.querySelector('p') as HTMLElement).getAttribute('style') ?? '';

    expect(styles).toContain('var(--background');
    expect(styles).toContain('var(--muted-foreground');
    expect(styles).not.toContain('.ai-shimmer[_ngcontent');
    expect(styles).not.toContain('var(--color-background');
    expect(styles).not.toContain('var(--color-muted-foreground');
  });

  it('updates the automatic spread when projected text changes', async () => {
    const element = fixture.nativeElement as HTMLElement;
    const paragraph = element.querySelector<HTMLElement>('p[aiShimmer]');

    fixture.componentInstance.text.set('Generating answer');
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();

    expect(paragraph?.style.getPropertyValue('--ai-shimmer-spread')).toBe('51px');
  });
});
