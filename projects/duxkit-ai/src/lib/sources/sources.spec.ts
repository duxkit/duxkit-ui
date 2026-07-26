import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Source, Sources, SourcesContent, SourcesTrigger } from './';

@Component({
  imports: [Source, Sources, SourcesContent, SourcesTrigger],
  template: `
    <ai-sources class="custom-sources" [expanded]="true">
      <button aiSourcesTrigger class="custom-trigger" [count]="count()"></button>
      <ai-sources-content class="custom-content">
        <a
          aiSource
          class="custom-source"
          href="https://stripe.com/docs"
          title="Stripe API Documentation"
        ></a>
        <a aiSource href="https://docs.github.com" title="GitHub REST API"></a>
      </ai-sources-content>
    </ai-sources>
  `,
})
class Host {
  readonly count = signal(2);
}

@Component({
  imports: [Source, Sources, SourcesContent, SourcesTrigger],
  template: `
    <ai-sources [expanded]="true">
      <button aiSourcesTrigger [count]="3">Custom sources</button>
      <ai-sources-content>
        <a aiSource href="https://angular.dev" title="Angular"></a>
      </ai-sources-content>
    </ai-sources>
  `,
})
class CustomTriggerHost {}

@Component({
  imports: [Source],
  template: `<a aiSource href="https://angular.dev"></a>`,
})
class UntitledSourceHost {}

describe('Sources', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders the default trigger and source links', () => {
    const element = fixture.nativeElement as HTMLElement;
    const trigger = element.querySelector('button[aisourcestrigger]');
    const links = element.querySelectorAll('a[aisource]');

    expect(trigger?.textContent).toContain('Used 2 sources');
    expect(trigger?.querySelector('ng-icon')).not.toBeNull();
    expect(links).toHaveLength(2);
    expect(links.item(0).textContent).toContain('Stripe API Documentation');
    expect(links.item(0).getAttribute('href')).toBe('https://stripe.com/docs');
    expect(links.item(0).getAttribute('target')).toBe('_blank');
    expect(links.item(0).getAttribute('rel')).toBe('noreferrer');
  });

  it('supports projected trigger content', async () => {
    const customFixture = TestBed.createComponent(CustomTriggerHost);
    customFixture.detectChanges();
    await customFixture.whenStable();

    const element = customFixture.nativeElement as HTMLElement;
    const trigger = element.querySelector('button[aisourcestrigger]');

    expect(trigger?.textContent).toContain('Custom sources');
    expect(trigger?.textContent).not.toContain('Used 3 sources');
  });

  it('uses the URL as the visible label when a source title is omitted', async () => {
    const untitledFixture = TestBed.createComponent(UntitledSourceHost);
    untitledFixture.detectChanges();
    await untitledFixture.whenStable();

    expect((untitledFixture.nativeElement as HTMLElement).textContent).toContain(
      'https://angular.dev',
    );
  });

  it('wires collapsible state through Brain directives', () => {
    const element = fixture.nativeElement as HTMLElement;
    const sources = element.querySelector('ai-sources');
    const trigger = element.querySelector('button[aisourcestrigger]');
    const content = element.querySelector('ai-sources-content');

    expect(sources?.getAttribute('data-state')).toBe('open');
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');
    expect(content?.getAttribute('data-state')).toBe('open');
  });

  it('applies default classes and preserves consumer classes', () => {
    const element = fixture.nativeElement as HTMLElement;
    const sources = element.querySelector('ai-sources');
    const trigger = element.querySelector('button[aisourcestrigger]');
    const content = element.querySelector('ai-sources-content');
    const source = element.querySelector('a[aisource]');

    expect(sources?.classList).toContain('not-prose');
    expect(sources?.classList).toContain('custom-sources');
    expect(trigger?.classList).toContain('gap-2');
    expect(trigger?.classList).toContain('custom-trigger');
    expect(content?.classList).toContain('data-[state=closed]:hidden');
    expect(content?.classList).toContain('custom-content');
    expect(source?.classList).toContain('items-center');
    expect(source?.classList).toContain('custom-source');
  });
});
