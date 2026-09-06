import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrnCommand } from '@spartan-ng/brain/command';
import { BrnSliderImports } from '@spartan-ng/brain/slider';
import { Attachment, AttachmentPreview, AttachmentRemove, Attachments } from './attachment';
import {
  ChainOfThought,
  ChainOfThoughtStep,
  ChainOfThoughtStepLabel,
  ChainOfThoughtTrigger,
} from './chain-of-thought';
import { CodeBlock, CodeBlockContent, CodeBlockCopy, CodeBlockRoot } from './code-block';
import { ContextData, ContextInputUsage } from './context';
import { Conversation, ConversationContent } from './conversation';
import { Message, MessageContent } from './message';
import {
  ModelSelectorCommand,
  ModelSelectorItem,
  ModelSelectorLogo,
  ModelSelectorNativeInput,
} from './model-selector';
import {
  PromptInput,
  PromptInputAttachments,
  PromptInputSubmit,
  PromptInputTextarea,
} from './prompt-input';
import { ContentClampDirective, Reasoning, ReasoningContent } from './reasoning';
import {
  ReasoningEffort,
  ReasoningEffortSlider,
  ReasoningEffortSliderState,
} from './reasoning-effort';
import { Shimmer } from './shimmer';
import { Sources, SourcesTrigger } from './sources';
import { Tool, ToolStatus } from './tool';

@Component({
  imports: [PromptInput, PromptInputTextarea, PromptInputAttachments, PromptInputSubmit],
  template: `<form
    aiPromptInput
    [(text)]="draft"
    [status]="status()"
    [disabled]="disabled()"
    [allowSubmitWhileGenerating]="queue()"
    [resetOnSubmit]="reset()"
    (promptSubmit)="submitted.push($event)"
  >
    <input name="title" aria-label="Title" value="Initial" />
    <textarea aiPromptInputTextarea aria-label="Prompt"></textarea>
    @if (stop()) {
      <button aiPromptInputSubmit></button>
    }
    <ai-prompt-input-attachments
      ><p data-custom-files>Custom attachments</p></ai-prompt-input-attachments
    >
  </form>`,
})
class PromptHost {
  readonly root = viewChild.required(PromptInput);
  readonly draft = signal('Hello');
  readonly status = signal<'ready' | 'streaming'>('ready');
  readonly disabled = signal(false);
  readonly queue = signal(false);
  readonly reset = signal(true);
  readonly stop = signal(true);
  readonly submitted: unknown[] = [];
}
@Component({
  imports: [Conversation, ConversationContent],
  template: `<ai-conversation [stickToBottom]="policy()"
    ><div aiConversationContent [observeMessages]="observe()"></div
  ></ai-conversation>`,
})
class ConversationHost {
  readonly policy = signal<boolean | 'auto'>(false);
  readonly observe = signal(true);
  readonly content = viewChild.required(ConversationContent);
}
@Component({
  imports: [ChainOfThought, ChainOfThoughtTrigger, ChainOfThoughtStepLabel, Shimmer],
  template: `<ai-chain-of-thought [expanded]="true" [isStreaming]="streaming()">
    <button aiChainOfThoughtTrigger>Steps</button>
    <span aiChainOfThoughtStepLabel aiShimmer class="custom">Thinking</span>
  </ai-chain-of-thought>`,
})
class ChainHost {
  readonly streaming = signal(false);
}
@Component({
  imports: [Attachment, Attachments, AttachmentPreview, AttachmentRemove],
  template: `<ai-attachments [variant]="variant()"
    ><ai-attachment [data]="file" (removed)="removed.set(true)">
      <ai-attachment-preview
        ><strong>First</strong>
        <section>Second <button aiAttachmentRemove>Remove</button></section></ai-attachment-preview
      >
      <button aiAttachmentRemove data-outside>Remove outside</button>
    </ai-attachment></ai-attachments
  >`,
})
class AttachmentHost {
  readonly variant = signal<'grid' | 'inline' | 'list'>('grid');
  readonly removed = signal(false);
  readonly file = {
    type: 'file' as const,
    url: '/file.txt',
    filename: 'file.txt',
    mediaType: 'text/plain',
  };
}
@Component({
  imports: [CodeBlock, CodeBlockRoot, CodeBlockContent, CodeBlockCopy],
  template: `<section aiCodeBlockRoot [code]="code()" language="ts">
      <button aiCodeBlockCopy>Custom copy</button><ai-code-block-content />
    </section>
    <ai-code-block code="preset"><b>Replaced preset</b></ai-code-block>`,
})
class CodeHost {
  readonly code = signal('const x = 1;');
}
@Component({
  imports: [Message, MessageContent, Reasoning, ReasoningContent],
  template: `<ng-template #renderer let-block
      ><output data-fence>{{ block.language }}: {{ block.code }}</output></ng-template
    >
    <ai-message from="assistant"
      ><ai-message-content [markdown]="markdown" [codeTemplate]="renderer"
    /></ai-message>
    <ai-reasoning [expanded]="true"
      ><ai-reasoning-content [markdown]="markdown" [codeTemplate]="renderer"
    /></ai-reasoning>`,
})
class MarkdownHost {
  readonly markdown = 'Before\n\n```ts\nconst x = 1;\n```';
}
@Component({
  imports: [Reasoning, ReasoningContent, ContentClampDirective, ChainOfThoughtStep],
  template: `<ai-reasoning [expanded]="true"
      ><ai-reasoning-content
        [(expanded)]="expanded"
        [collapsedMaxHeight]="20"
        [showControls]="false"
        >Reasoning</ai-reasoning-content
      ></ai-reasoning
    >
    <div aiContentClamp #clamp="aiContentClamp" [(expanded)]="expanded" [collapsedMaxHeight]="20">
      Long content
    </div>
    <button (click)="clamp.expandContent()">Expand</button>
    <ng-template #layout let-step
      ><article data-layout>{{ step.status() }}</article></ng-template
    >
    <ai-chain-of-thought-step status="active" [layout]="layout" />`,
})
class ClampHost {
  readonly expanded = signal(false);
}
@Component({
  imports: [ContextData, ContextInputUsage],
  template: `<section aiContextData [usedTokens]="0" [maxTokens]="100">
    <ai-context-input-usage><p data-zero>No usage yet</p></ai-context-input-usage>
    <ai-context-input-usage [showZero]="true" data-default />
  </section>`,
})
class ContextHost {}
@Component({
  imports: [ModelSelectorCommand, ModelSelectorNativeInput, ModelSelectorItem, ModelSelectorLogo],
  template: `<section aiModelSelectorCommand [(search)]="search" [filter]="filter">
      <input aiModelSelectorInput aria-label="Find model" name="model" autocomplete="off" />
      <button aiModelSelectorItem value="alpha" (selected)="selected.push('alpha')">Alpha</button>
      <button aiModelSelectorItem value="beta">Beta</button>
    </section>
    <ai-model-selector-logo [src]="src()" alt="Custom model"
      ><b data-fallback>Logo unavailable</b></ai-model-selector-logo
    >`,
})
class ModelHost {
  readonly search = signal('');
  readonly src = signal('/custom.svg');
  readonly selected: string[] = [];
  readonly filter = (value: string, query: string) => value.startsWith(query);
}
@Component({
  imports: [ReasoningEffort, ReasoningEffortSliderState, ReasoningEffortSlider, BrnSliderImports],
  template: `<ai-reasoning-effort [(value)]="value" [disabled]="disabled()">
    <section aiReasoningEffortSliderState #mapping="aiReasoningEffortSliderState">
      <div
        brnSlider
        aria-label="Custom effort"
        [min]="0"
        [max]="mapping.maxIndex()"
        [step]="1"
        [value]="mapping.sliderValue()"
        (valueChange)="mapping.selectSliderValue($event)"
        [disabled]="mapping.isDisabled()"
      >
        <div brnSliderTrack><div brnSliderRange></div></div>
        <span brnSliderThumb></span>
      </div>
      <p>Custom labels</p>
    </section>
    <ai-reasoning-effort-slider orientation="vertical" [showLabels]="false" />
  </ai-reasoning-effort>`,
})
class EffortHost {
  readonly value = signal('medium');
  readonly disabled = signal(false);
  readonly mapping = viewChild.required(ReasoningEffortSliderState);
}
@Component({
  imports: [Tool, ToolStatus, Sources, SourcesTrigger],
  template: `<ai-tool [part]="part"
      ><ai-tool-status><b data-status>Custom status</b></ai-tool-status></ai-tool
    >
    <ai-sources><button aiSourcesTrigger>Custom sources</button></ai-sources>`,
})
class FallbackHost {
  readonly part = {
    type: 'dynamic-tool' as const,
    toolName: 'lookup',
    toolCallId: '1',
    state: 'input-available' as const,
    input: {},
  };
}

async function render<T>(host: new () => T) {
  await TestBed.configureTestingModule({ imports: [host] }).compileComponents();
  const fixture = TestBed.createComponent(host);
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

describe('consumer composition contracts', () => {
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });
  it('blocks keyboard, form and imperative submission while streaming, with or without a Stop button', async () => {
    const f = await render(PromptHost);
    f.componentInstance.status.set('streaming');
    f.detectChanges();
    const textarea = f.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    f.nativeElement.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }));
    await f.componentInstance.root().submit();
    f.componentInstance.stop.set(false);
    f.detectChanges();
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await f.whenStable();
    expect(f.componentInstance.submitted).toEqual([]);
    f.componentInstance.queue.set(true);
    f.detectChanges();
    await f.componentInstance.root().submit();
    expect(f.componentInstance.submitted).toHaveLength(1);
  });
  it('honors root disabled state without querying submit button markup', async () => {
    const f = await render(PromptHost);
    f.componentInstance.disabled.set(true);
    f.detectChanges();
    await f.componentInstance.root().submit();
    expect(f.componentInstance.submitted).toHaveLength(0);
  });
  it('supports controlled draft, explicit reset and custom attachment rendering without resetting other controls', async () => {
    const f = await render(PromptHost);
    f.componentInstance.reset.set(false);
    f.detectChanges();
    const title = f.nativeElement.querySelector('input[name=title]') as HTMLInputElement;
    title.value = 'Keep this';
    await f.componentInstance.root().submit();
    expect(f.componentInstance.draft()).toBe('Hello');
    f.componentInstance.root().clear();
    f.detectChanges();
    expect(f.componentInstance.draft()).toBe('');
    expect(title.value).toBe('Keep this');
    expect(f.nativeElement.querySelector('[data-custom-files]')).not.toBeNull();
  });
  it('preserves a draft edited while file conversion is pending and prevents duplicate sends', async () => {
    const f = await render(PromptHost);
    let finish!: (buffer: ArrayBuffer) => void;
    const file = new File(['x'], 'x.txt', { type: 'text/plain' });
    Object.defineProperty(file, 'arrayBuffer', {
      value: () =>
        new Promise<ArrayBuffer>((resolve) => {
          finish = resolve;
        }),
    });
    f.componentInstance
      .root()
      .files.set([{ id: 'external', type: 'file', file, url: '/x.txt', mediaType: 'text/plain' }]);
    const pending = f.componentInstance.root().submit();
    await f.componentInstance.root().submit();
    f.componentInstance.draft.set('Next draft');
    f.detectChanges();
    finish(new Uint8Array([120]).buffer);
    await pending;
    f.detectChanges();
    expect(f.componentInstance.submitted).toHaveLength(1);
    expect(f.componentInstance.draft()).toBe('Next draft');
  });
  it('rechecks eligibility when conversion finishes', async () => {
    const f = await render(PromptHost);
    let finish!: (buffer: ArrayBuffer) => void;
    const file = new File(['x'], 'x.txt');
    Object.defineProperty(file, 'arrayBuffer', {
      value: () =>
        new Promise<ArrayBuffer>((resolve) => {
          finish = resolve;
        }),
    });
    f.componentInstance
      .root()
      .files.set([{ id: 'external', type: 'file', file, url: '/x.txt', mediaType: 'text/plain' }]);
    const pending = f.componentInstance.root().submit();
    f.componentInstance.disabled.set(true);
    f.detectChanges();
    finish(new ArrayBuffer(0));
    await pending;
    expect(f.componentInstance.submitted).toHaveLength(0);
    expect(f.componentInstance.draft()).toBe('Hello');
  });
  it('revokes only owned object URLs when controlled files are replaced', async () => {
    const create = vi.fn(() => 'blob:owned');
    const revoke = vi.fn();
    const originalCreate = URL.createObjectURL;
    const originalRevoke = URL.revokeObjectURL;
    URL.createObjectURL = create;
    URL.revokeObjectURL = revoke;
    try {
      const f = await render(PromptHost);
      f.componentInstance.root().addFiles([new File(['x'], 'x.txt')]);
      f.detectChanges();
      f.componentInstance.root().files.set([
        {
          id: 'external',
          type: 'file',
          file: new File([], 'external'),
          url: 'blob:external',
          mediaType: 'text/plain',
        },
      ]);
      f.detectChanges();
      await f.whenStable();
      f.componentInstance.root().clear();
      f.destroy();
      expect(revoke.mock.calls).toEqual([['blob:owned']]);
    } finally {
      URL.createObjectURL = originalCreate;
      URL.revokeObjectURL = originalRevoke;
    }
  });
  it('respects disabled automatic scrolling but permits an explicit jump without an anchor', async () => {
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    const f = await render(ConversationHost);
    const el = f.nativeElement.querySelector('[aiConversationContent]') as HTMLElement;
    const scroll = vi.fn();
    el.scrollTo = scroll;
    const message = document.createElement('div');
    message.dataset['aiMessageRole'] = 'user';
    el.append(message);
    await Promise.resolve();
    frames.splice(0).forEach((callback) => callback(0));
    expect(scroll).not.toHaveBeenCalled();
    f.componentInstance.content().notifyMessageAdded('user');
    expect(frames).toHaveLength(0);
    f.componentInstance.content().scrollToBottom();
    frames.splice(0).forEach((callback) => callback(0));
    expect(scroll).toHaveBeenCalledOnce();
    vi.restoreAllMocks();
  });
  it('preserves initial expansion and composes shimmer on a styled label host', async () => {
    const f = await render(ChainHost);
    expect(f.nativeElement.querySelector('button').getAttribute('aria-expanded')).toBe('true');
    const label = f.nativeElement.querySelector('span') as HTMLElement;
    expect(label.textContent).toBe('Thinking');
    expect(label.classList).toContain('ai-shimmer');
    expect(label.classList).toContain('custom');
    f.componentInstance.streaming.set(true);
    f.detectChanges();
    f.componentInstance.streaming.set(false);
    f.detectChanges();
    expect(f.nativeElement.querySelector('button').getAttribute('aria-expanded')).toBe('false');
  });
  it('preserves an explicitly collapsed root when initially streaming', async () => {
    await TestBed.configureTestingModule({ imports: [ChainHost] })
      .overrideComponent(ChainHost, {
        set: {
          imports: [ChainOfThought, ChainOfThoughtTrigger],
          template:
            '<ai-chain-of-thought [expanded]="false" [isStreaming]="true"><button aiChainOfThoughtTrigger>Steps</button></ai-chain-of-thought>',
        },
      })
      .compileComponents();
    const f = TestBed.createComponent(ChainHost);
    f.detectChanges();
    await f.whenStable();
    expect(f.nativeElement.querySelector('button').getAttribute('aria-expanded')).toBe('false');
  });
  it.each(['grid', 'inline', 'list'] as const)(
    'preserves arbitrary preview order and reachable removal in %s',
    async (variant) => {
      const f = await render(AttachmentHost);
      f.componentInstance.variant.set(variant);
      f.detectChanges();
      const preview = f.nativeElement.querySelector('ai-attachment-preview') as HTMLElement;
      expect(Array.from(preview.children).map((child) => child.tagName)).toEqual([
        'STRONG',
        'SECTION',
      ]);
      const outside = f.nativeElement.querySelector('[data-outside]') as HTMLButtonElement;
      expect(outside.hidden).toBe(false);
      outside.click();
      expect(f.componentInstance.removed()).toBe(true);
    },
  );
  it('reorders code parts, shares reactive code and replaces the default preset', async () => {
    const writeText = vi.fn(async () => {});
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    const f = await render(CodeHost);
    f.componentInstance.code.set('const x = 2;');
    f.detectChanges();
    f.nativeElement.querySelector('button').click();
    await Promise.resolve();
    expect(writeText).toHaveBeenCalledWith('const x = 2;');
    expect(f.nativeElement.querySelector('code').textContent).toContain('const x = 2;');
    expect(f.nativeElement.querySelector('ai-code-block code')).toBeNull();
  });
  it('replaces code-fence renderers in both message and reasoning markdown', async () => {
    const f = await render(MarkdownHost);
    expect(f.nativeElement.querySelectorAll('[data-fence]')).toHaveLength(2);
    expect(f.nativeElement.querySelector('ai-code-block')).toBeNull();
    expect(f.nativeElement.textContent).toContain('Before');
  });
  it('shares controlled clamp expansion with external controls and replaces the step layout', async () => {
    const f = await render(ClampHost);
    const content = f.nativeElement.querySelector('[aiContentClamp]') as HTMLElement;
    expect(content.style.maxHeight).toBe('20px');
    f.nativeElement.querySelector('button').click();
    f.detectChanges();
    expect(f.componentInstance.expanded()).toBe(true);
    expect(content.style.maxHeight).toBe('');
    expect(f.nativeElement.querySelector('[data-layout]').textContent).toBe('active');
    expect(f.nativeElement.querySelector('ai-chain-of-thought-step ng-icon')).toBeNull();
  });
  it('renders usage without a hover container and preserves projected zero content', async () => {
    const f = await render(ContextHost);
    expect(f.nativeElement.querySelector('[data-zero]').textContent).toBe('No usage yet');
    expect(f.nativeElement.querySelector('[data-default]').textContent).toContain('0');
  });
  it('supports native search attributes, custom filtering and exactly one Enter selection without a dialog', async () => {
    const f = await render(ModelHost);
    const input = f.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'al';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    f.detectChanges();
    expect(f.componentInstance.search()).toBe('al');
    expect(input.name).toBe('model');
    expect(input.autocomplete).toBe('off');
    const command = f.debugElement
      .query(By.directive(ModelSelectorCommand))
      .injector.get(BrnCommand);
    command.keyManager.setFirstItemActive();
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(f.componentInstance.selected).toEqual(['alpha']);
    expect(f.nativeElement.querySelectorAll('button')[1]?.hasAttribute('data-hidden')).toBe(true);
  });
  it('shows a custom logo fallback after failure and retries a changed source', async () => {
    const f = await render(ModelHost);
    f.nativeElement.querySelector('img').dispatchEvent(new Event('error'));
    f.detectChanges();
    expect(f.nativeElement.querySelector('[data-fallback]')).not.toBeNull();
    f.componentInstance.src.set('/next.svg');
    f.detectChanges();
    await f.whenStable();
    expect(f.nativeElement.querySelector('img').getAttribute('src')).toBe('/next.svg');
  });
  it('maps custom sliders to effort levels and forwards vertical orientation', async () => {
    const f = await render(EffortHost);
    const mapping = f.componentInstance.mapping();
    mapping.selectSliderValue([0]);
    f.detectChanges();
    expect(f.componentInstance.value()).toBe(mapping.reasoningEffort.levels()[0]?.value);
    f.componentInstance.disabled.set(true);
    f.detectChanges();
    mapping.selectSliderValue([2]);
    expect(f.componentInstance.value()).toBe(mapping.reasoningEffort.levels()[0]?.value);
    expect(
      f.nativeElement
        .querySelector('ai-reasoning-effort-slider [brnSlider]')
        .getAttribute('data-orientation'),
    ).toBe('vertical');
  });
  it('replaces status and sources labels without supplying fallback-only data', async () => {
    const f = await render(FallbackHost);
    expect(f.nativeElement.querySelector('[data-status]').textContent).toBe('Custom status');
    expect(f.nativeElement.querySelector('button').textContent).toBe('Custom sources');
  });
});
