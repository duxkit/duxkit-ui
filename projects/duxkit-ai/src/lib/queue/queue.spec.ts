import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HlmButton } from '@duxkit-private/ui/helm/button';
import { Queue } from './queue';
import { QueueItem } from './queue-item';
import { QueueItemAction } from './queue-item-action';
import { QueueItemActions } from './queue-item-actions';
import { QueueItemAttachment } from './queue-item-attachment';
import { QueueItemContent } from './queue-item-content';
import { QueueItemDescription } from './queue-item-description';
import { QueueItemFile } from './queue-item-file';
import { QueueItemImage } from './queue-item-image';
import { QueueItemIndicator } from './queue-item-indicator';
import { QueueList } from './queue-list';
import { QueueSection } from './queue-section';
import { QueueSectionContent } from './queue-section-content';
import { QueueSectionCount } from './queue-section-count';
import { QueueSectionLabel } from './queue-section-label';
import { QueueSectionTrigger } from './queue-section-trigger';

@Component({
  imports: [
    Queue,
    QueueItem,
    QueueItemAction,
    QueueItemActions,
    QueueItemAttachment,
    QueueItemContent,
    QueueItemDescription,
    QueueItemFile,
    QueueItemImage,
    QueueItemIndicator,
    QueueList,
    QueueSection,
    QueueSectionContent,
    QueueSectionCount,
    QueueSectionLabel,
    QueueSectionTrigger,
    HlmButton,
  ],
  template: `
    <ai-queue class="custom-queue">
      <ai-queue-section [expanded]="expanded()">
        <button aiQueueSectionTrigger class="custom-trigger">
          <ai-queue-section-label class="custom-label">
            <span aiQueueSectionCount>2</span>
            <span>Queued tasks</span>
          </ai-queue-section-label>
        </button>
        <ai-queue-section-content class="custom-content">
          <ai-queue-list class="custom-list">
            <ai-queue-item class="custom-item">
              <div class="flex items-start gap-3">
                <span aiQueueItemIndicator></span>
                <span aiQueueItemContent>Search the workspace</span>
                <span aiQueueItemActions>
                  <button aiQueueItemAction aria-label="Remove queued task">Remove</button>
                  <button
                    aiQueueItemAction
                    hlmBtn
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Retry queued task"
                  >
                    Retry
                  </button>
                </span>
              </div>
              <ai-queue-item-description>Find related primitives.</ai-queue-item-description>
              <ai-queue-item-attachment>
                <img aiQueueItemImage src="test.png" alt="Generated preview" />
                <ai-queue-item-file>queue.ts</ai-queue-item-file>
              </ai-queue-item-attachment>
            </ai-queue-item>
            <ai-queue-item>
              <div class="flex items-start gap-3">
                <span aiQueueItemIndicator [completed]="true"></span>
                <span aiQueueItemContent [completed]="true">Write tests</span>
              </div>
              <ai-queue-item-description [completed]="true"
                >Covered class merging.</ai-queue-item-description
              >
            </ai-queue-item>
          </ai-queue-list>
        </ai-queue-section-content>
      </ai-queue-section>
    </ai-queue>
  `,
})
class Host {
  readonly expanded = signal(true);
}

describe('Queue', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders the queue, section, list, items, attachments, and custom classes', () => {
    const element = fixture.nativeElement as HTMLElement;
    const queue = element.querySelector('ai-queue');
    const trigger = element.querySelector<HTMLButtonElement>('button[aiqueuesectiontrigger]');
    const label = element.querySelector('ai-queue-section-label');
    const content = element.querySelector('ai-queue-section-content');
    const list = element.querySelector('ai-queue-list');
    const item = element.querySelector('ai-queue-item');
    const image = element.querySelector<HTMLImageElement>('img[aiqueueitemimage]');
    const file = element.querySelector('ai-queue-item-file');

    expect(queue?.classList).toContain('custom-queue');
    expect(queue?.classList).toContain('rounded-lg');
    expect(trigger?.classList).toContain('custom-trigger');
    expect(label?.textContent).toContain('2');
    expect(label?.textContent).toContain('Queued tasks');
    expect(label?.querySelector('[aiQueueSectionCount]')?.classList).toContain('tabular-nums');
    expect(label?.classList).toContain('custom-label');
    expect(content?.classList).toContain('custom-content');
    expect(list?.classList).toContain('custom-list');
    expect(item?.classList).toContain('custom-item');
    expect(image?.getAttribute('alt')).toBe('Generated preview');
    expect(image?.getAttribute('height')).toBe('32');
    expect(image?.getAttribute('width')).toBe('32');
    expect(file?.textContent).toContain('queue.ts');
  });

  it('uses accessible list roles for custom elements', () => {
    const element = fixture.nativeElement as HTMLElement;
    const list = element.querySelector('ai-queue-list');
    const items = element.querySelectorAll('ai-queue-item');

    expect(list?.getAttribute('role')).toBe('list');
    expect(items.item(0).getAttribute('role')).toBe('listitem');
  });

  it('toggles section content from the trigger', async () => {
    const element = fixture.nativeElement as HTMLElement;
    const section = element.querySelector('ai-queue-section');
    const trigger = element.querySelector<HTMLButtonElement>('button[aiqueuesectiontrigger]');
    const content = element.querySelector('ai-queue-section-content');

    expect(section?.getAttribute('data-state')).toBe('open');
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');

    trigger?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(section?.getAttribute('data-state')).toBe('closed');
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    expect(content?.classList).toContain('data-[state=closed]:hidden');
  });

  it('supports controlled collapsed state', async () => {
    fixture.componentInstance.expanded.set(false);
    fixture.detectChanges();
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const section = element.querySelector('ai-queue-section');
    const trigger = element.querySelector<HTMLButtonElement>('button[aiqueuesectiontrigger]');

    expect(section?.getAttribute('data-state')).toBe('closed');
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
  });

  it('renders completed item states and defaults actions to type button', () => {
    const element = fixture.nativeElement as HTMLElement;
    const completedIndicator = element.querySelectorAll('[aiqueueitemindicator]').item(1);
    const completedContent = element.querySelectorAll('[aiqueueitemcontent]').item(1);
    const completedDescription = element.querySelectorAll('ai-queue-item-description').item(1);
    const action = element.querySelector<HTMLButtonElement>('button[aiqueueitemaction]');

    expect(completedIndicator.classList).toContain('bg-muted-foreground/10');
    expect(completedContent.classList).toContain('line-through');
    expect(completedDescription.classList).toContain('line-through');
    expect(action?.getAttribute('type')).toBe('button');
    expect(action?.getAttribute('aria-label')).toBe('Remove queued task');
  });

  it('preserves HLM button classes when composed on queue item actions', () => {
    const element = fixture.nativeElement as HTMLElement;
    const action = element.querySelector<HTMLButtonElement>(
      'button[aiqueueitemaction][hlmbtn][aria-label="Retry queued task"]',
    );

    expect(action?.getAttribute('data-slot')).toBe('button');
    expect(action?.classList).toContain('size-8');
    expect(action?.classList).toContain('hover:bg-muted');
  });
});
