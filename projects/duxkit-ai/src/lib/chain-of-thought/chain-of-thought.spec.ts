import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtImage,
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
  ChainOfThoughtTrigger,
} from './';

@Component({
  imports: [
    ChainOfThought,
    ChainOfThoughtContent,
    ChainOfThoughtImage,
    ChainOfThoughtSearchResult,
    ChainOfThoughtSearchResults,
    ChainOfThoughtStep,
    ChainOfThoughtTrigger,
  ],
  template: `
    <ai-chain-of-thought class="custom-chain" [expanded]="expanded()">
      <button aiChainOfThoughtTrigger class="custom-trigger">Thinking trace</button>

      <ai-chain-of-thought-content class="custom-content">
        <ai-chain-of-thought-step
          class="custom-step"
          status="active"
          icon="lucideSearch"
          label="Searching documentation"
          description="Looking for the relevant API surface."
        >
          <ai-chain-of-thought-search-results>
            <span aiChainOfThoughtSearchResult>AI SDK</span>
            <span aiChainOfThoughtSearchResult>Angular</span>
          </ai-chain-of-thought-search-results>
        </ai-chain-of-thought-step>

        <ai-chain-of-thought-step
          status="pending"
          label="Summarising findings"
          description="Preparing the answer."
        />

        <ai-chain-of-thought-image caption="Generated preview">
          <div class="preview">Preview</div>
        </ai-chain-of-thought-image>
      </ai-chain-of-thought-content>
    </ai-chain-of-thought>
  `,
})
class Host {
  readonly expanded = signal(true);
}

@Component({
  imports: [ChainOfThought, ChainOfThoughtTrigger],
  template: `
    <ai-chain-of-thought [isStreaming]="isStreaming()">
      <button aiChainOfThoughtTrigger></button>
    </ai-chain-of-thought>
  `,
})
class StreamingHost {
  readonly isStreaming = signal(false);
}

@Component({
  imports: [ChainOfThought, ChainOfThoughtContent, ChainOfThoughtStep, ChainOfThoughtTrigger],
  template: `
    <ai-chain-of-thought [expanded]="true">
      <button aiChainOfThoughtTrigger></button>
      <ai-chain-of-thought-content>
        <ai-chain-of-thought-step collapsedMaxHeight="120px" [pinToBottom]="true" label="Long step">
          <p>Line one</p>
          <p>Line two</p>
          <p>Line three</p>
        </ai-chain-of-thought-step>
      </ai-chain-of-thought-content>
    </ai-chain-of-thought>
  `,
})
class ClampedStepHost {}

describe('ChainOfThought', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders the trigger, content, steps, search results, and image caption', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('button[aichainofthoughttrigger]')?.textContent).toContain(
      'Thinking trace',
    );
    expect(element.querySelector('ai-chain-of-thought-content')?.textContent).toContain(
      'Searching documentation',
    );
    expect(element.querySelector('ai-chain-of-thought-content')?.textContent).toContain(
      'Looking for the relevant API surface.',
    );
    expect(element.querySelector('ai-chain-of-thought-search-results')?.textContent).toContain(
      'AI SDK',
    );
    expect(element.querySelector('ai-chain-of-thought-image')?.textContent).toContain(
      'Generated preview',
    );
  });

  it('applies defaults while preserving consumer classes', () => {
    const element = fixture.nativeElement as HTMLElement;
    const chain = element.querySelector('ai-chain-of-thought');
    const trigger = element.querySelector('button[aichainofthoughttrigger]');
    const content = element.querySelector('ai-chain-of-thought-content');
    const step = element.querySelector('ai-chain-of-thought-step');

    expect(chain?.classList).toContain('w-full');
    expect(chain?.classList).toContain('custom-chain');
    expect(trigger?.classList).toContain('text-muted-foreground');
    expect(trigger?.classList).toContain('custom-trigger');
    expect(content?.classList).toContain('data-[state=closed]:hidden');
    expect(content?.classList).toContain('custom-content');
    expect(step?.getAttribute('data-status')).toBe('active');
    expect(step?.classList).toContain('custom-step');
  });

  it('tracks and renders the completed thinking duration', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000);

    const streamingFixture = TestBed.createComponent(StreamingHost);
    streamingFixture.detectChanges();
    await streamingFixture.whenStable();

    streamingFixture.componentInstance.isStreaming.set(true);
    streamingFixture.detectChanges();
    await streamingFixture.whenStable();

    expect(streamingFixture.nativeElement.textContent).toContain('Thinking...');

    vi.setSystemTime(6_500);
    streamingFixture.componentInstance.isStreaming.set(false);
    streamingFixture.detectChanges();
    await streamingFixture.whenStable();

    expect(streamingFixture.nativeElement.textContent).toContain('Thought for 6 seconds');

    vi.useRealTimers();
  });

  it('can clamp long step content behind a show more control', async () => {
    const scrollHeight = vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get');
    const clientHeight = vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get');

    scrollHeight.mockReturnValue(300);
    clientHeight.mockReturnValue(120);

    const clampedFixture = TestBed.createComponent(ClampedStepHost);
    clampedFixture.detectChanges();
    await clampedFixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 0));
    clampedFixture.detectChanges();
    await clampedFixture.whenStable();

    const element = clampedFixture.nativeElement as HTMLElement;
    const clampedContent = element.querySelector<HTMLElement>('[style*="max-height"]');
    const showMore = element.querySelector<HTMLButtonElement>(
      'ai-chain-of-thought-step button[type="button"]',
    );

    expect(clampedContent?.style.maxHeight).toBe('120px');
    expect(clampedContent?.style.getPropertyValue('mask-image')).toContain('linear-gradient');
    expect(clampedContent?.style.getPropertyValue('mask-image')).toContain('black 70%');
    expect(clampedContent?.style.getPropertyValue('mask-image')).toContain('transparent');
    expect(clampedContent?.scrollTop).toBe(300);
    expect(showMore).not.toBeNull();
    expect(showMore?.textContent).toContain('Show more');

    showMore?.click();
    clampedFixture.detectChanges();
    await clampedFixture.whenStable();

    expect(clampedContent?.style.maxHeight).toBe('');
    expect(clampedContent?.style.getPropertyValue('mask-image')).toBe('');

    const showLess = element.querySelector<HTMLButtonElement>(
      'ai-chain-of-thought-step button[type="button"]',
    );

    expect(showLess?.textContent).toContain('Show less');

    showLess?.click();
    clampedFixture.detectChanges();
    await clampedFixture.whenStable();

    expect(clampedContent?.style.maxHeight).toBe('120px');
    expect(clampedContent?.style.getPropertyValue('mask-image')).toContain('linear-gradient');

    scrollHeight.mockRestore();
    clientHeight.mockRestore();
  });
});
