import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Reasoning } from './reasoning';
import { ReasoningContent } from './reasoning-content';

@Component({
  imports: [Reasoning, ReasoningContent],
  template: `
    <ai-reasoning [isStreaming]="isStreaming()">
      <ai-reasoning-content class="custom-content">Reasoning text</ai-reasoning-content>
    </ai-reasoning>
  `,
})
class Host {
  readonly isStreaming = signal(true);
  readonly content = viewChild.required(ReasoningContent);
}

@Component({
  imports: [Reasoning, ReasoningContent],
  template: `
    <ai-reasoning [isStreaming]="true">
      <ai-reasoning-content [markdown]="markdown()" />
    </ai-reasoning>
  `,
})
class MarkdownHost {
  readonly markdown = signal(
    [
      '**Reasoning**',
      '',
      '| Step | Status |',
      '| --- | --- |',
      '| Parse | Done |',
      '',
      '```json',
      '{ "status": "ok" }',
      '```',
      '',
      '<script>alert("x")</script><img src="x" onerror="alert(1)">',
    ].join('\n'),
  );
}

@Component({
  imports: [Reasoning, ReasoningContent],
  template: `
    <ai-reasoning [isStreaming]="true">
      <ai-reasoning-content collapsedMaxHeight="120px">
        <p>Line one</p>
        <p>Line two</p>
        <p>Line three</p>
      </ai-reasoning-content>
    </ai-reasoning>
  `,
})
class ClampedHost {}

describe('ReasoningContent', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('matches element usage and preserves projected content', () => {
    const element = fixture.nativeElement as HTMLElement;
    const content = element.querySelector('ai-reasoning-content');

    expect(fixture.componentInstance.content()).toBeTruthy();
    expect(content?.textContent).toContain('Reasoning text');
  });

  it('applies default content classes and preserves consumer classes', () => {
    const element = fixture.nativeElement as HTMLElement;
    const content = element.querySelector('ai-reasoning-content');

    expect(content?.classList).toContain('mt-4');
    expect(content?.classList).toContain('text-sm');
    expect(content?.classList).toContain('text-muted-foreground');
    expect(content?.classList).toContain('data-[state=closed]:hidden');
    expect(content?.classList).toContain('custom-content');
  });

  it('renders markdown when the markdown input is provided', async () => {
    await TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [MarkdownHost],
      })
      .compileComponents();

    const markdownFixture = TestBed.createComponent(MarkdownHost);
    markdownFixture.detectChanges();
    await markdownFixture.whenStable();

    const element = markdownFixture.nativeElement as HTMLElement;
    const markdown = element.querySelector('.ai-markdown');
    const strong = element.querySelector('strong');
    const script = element.querySelector('script');
    const image = element.querySelector('img');

    expect(markdown?.classList).toContain('ai-markdown');
    expect(markdown?.classList).toContain('ai-markdown-reasoning');
    expect(strong?.textContent).toBe('Reasoning');
    expect(element.querySelector('table')).not.toBeNull();
    expect(element.querySelector('th')?.textContent).toBe('Step');
    expect(element.querySelector('ai-code-block')).not.toBeNull();
    expect(element.querySelector('ai-code-block')?.getAttribute('data-language')).toBe('json');
    expect(element.querySelector('ai-code-block code.language-json')).not.toBeNull();
    expect(element.querySelector('ai-code-block .hljs-attr')?.textContent).toContain('status');
    expect(script).toBeNull();
    expect(image?.getAttribute('onerror')).toBeNull();
  });

  it('can clamp long reasoning content behind a show more control', async () => {
    const scrollHeight = vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get');
    const clientHeight = vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get');

    scrollHeight.mockReturnValue(300);
    clientHeight.mockReturnValue(120);

    await TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [ClampedHost],
      })
      .compileComponents();

    const clampedFixture = TestBed.createComponent(ClampedHost);
    clampedFixture.detectChanges();
    await clampedFixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 0));
    clampedFixture.detectChanges();
    await clampedFixture.whenStable();

    const element = clampedFixture.nativeElement as HTMLElement;
    const clampedContent = element.querySelector<HTMLElement>('[style*="max-height"]');
    const showMore = element.querySelector<HTMLButtonElement>('button[type="button"]');

    expect(clampedContent?.style.maxHeight).toBe('120px');
    expect(showMore).not.toBeNull();
    expect(showMore?.textContent).toContain('Show more');

    showMore?.click();
    clampedFixture.detectChanges();
    await clampedFixture.whenStable();

    expect(clampedContent?.style.maxHeight).toBe('');

    const showLess = element.querySelector<HTMLButtonElement>('button[type="button"]');

    expect(showLess?.textContent).toContain('Show less');

    showLess?.click();
    clampedFixture.detectChanges();
    await clampedFixture.whenStable();

    expect(clampedContent?.style.maxHeight).toBe('120px');

    scrollHeight.mockRestore();
    clientHeight.mockRestore();
  });
});
