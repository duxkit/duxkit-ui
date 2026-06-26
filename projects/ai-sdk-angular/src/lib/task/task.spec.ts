import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Task } from './task';
import { TaskContent } from './task-content';
import { TaskItem } from './task-item';
import { TaskItemFile } from './task-item-file';
import { TaskTrigger } from './task-trigger';

@Component({
  imports: [Task, TaskContent, TaskItem, TaskItemFile, TaskTrigger],
  template: `
    <ai-task class="custom-task">
      <button aiTaskTrigger class="custom-trigger">Searching files</button>
      <ai-task-content class="custom-content">
        <ai-task-item class="custom-item">
          Found references in <ai-task-item-file class="custom-file">app.ts</ai-task-item-file>
        </ai-task-item>
      </ai-task-content>
    </ai-task>
  `,
})
class Host {}

@Component({
  imports: [Task, TaskContent, TaskTrigger],
  template: `
    <ai-task [expanded]="false">
      <button aiTaskTrigger>Closed task</button>
      <ai-task-content>Hidden content</ai-task-content>
    </ai-task>
  `,
})
class ClosedHost {}

describe('Task', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders the default trigger, content, items, and file badge', () => {
    const element = fixture.nativeElement as HTMLElement;
    const task = element.querySelector('ai-task');
    const trigger = element.querySelector('button[aitasktrigger]');
    const content = element.querySelector('ai-task-content');
    const item = element.querySelector('ai-task-item');
    const file = element.querySelector('ai-task-item-file');

    expect(task?.classList).toContain('custom-task');
    expect(trigger?.textContent).toContain('Searching files');
    expect(trigger?.classList).toContain('custom-trigger');
    expect(content?.classList).toContain('custom-content');
    expect(item?.classList).toContain('text-muted-foreground');
    expect(item?.classList).toContain('custom-item');
    expect(file?.classList).toContain('rounded-md');
    expect(file?.classList).toContain('custom-file');
  });

  it('is open by default and toggles from the trigger', async () => {
    const element = fixture.nativeElement as HTMLElement;
    const task = element.querySelector('ai-task');
    const trigger = element.querySelector<HTMLButtonElement>('button[aitasktrigger]');

    expect(task?.getAttribute('data-state')).toBe('open');
    expect(trigger?.getAttribute('aria-expanded')).toBe('true');

    trigger?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(task?.getAttribute('data-state')).toBe('closed');
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
  });

  it('supports controlled collapsed state', async () => {
    const closedFixture = TestBed.createComponent(ClosedHost);
    closedFixture.detectChanges();
    await closedFixture.whenStable();

    const element = closedFixture.nativeElement as HTMLElement;
    const task = element.querySelector('ai-task');
    const trigger = element.querySelector('button[aitasktrigger]');
    const content = element.querySelector('ai-task-content');

    expect(task?.getAttribute('data-state')).toBe('closed');
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    expect(content?.classList).toContain('data-[state=closed]:hidden');
  });
});
