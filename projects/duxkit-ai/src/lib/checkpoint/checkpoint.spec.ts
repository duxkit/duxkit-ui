import { Component, signal, viewChildren } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HlmButton } from '@duxkit-private/ui/helm/button';

import { Checkpoint, CheckpointIcon, CheckpointTrigger } from './';

@Component({
  imports: [Checkpoint, CheckpointIcon, CheckpointTrigger],
  template: `
    <ai-checkpoint class="custom-checkpoint">
      <ai-checkpoint-icon class="custom-icon" />
      <button
        aiCheckpointTrigger
        class="custom-trigger"
        [ariaLabel]="restoreLabel()"
        (checkpointRestore)="restoreCount.update((count) => count + 1)"
      >
        Restore checkpoint
      </button>
    </ai-checkpoint>

    <div aiCheckpoint>
      <span aiCheckpointIcon>Custom marker</span>
      <ai-checkpoint-trigger>Restore alternate</ai-checkpoint-trigger>
    </div>
  `,
})
class Host {
  readonly restoreLabel = signal('Restore to checkpoint before tool call');
  readonly restoreCount = signal(0);
  readonly checkpoints = viewChildren(Checkpoint);
  readonly icons = viewChildren(CheckpointIcon);
  readonly triggers = viewChildren(CheckpointTrigger);
}

@Component({
  imports: [Checkpoint, CheckpointIcon, CheckpointTrigger, HlmButton],
  template: `
    <ai-checkpoint>
      <ai-checkpoint-icon />
      <button aiCheckpointTrigger hlmBtn variant="ghost" size="sm">Restore checkpoint</button>
    </ai-checkpoint>
  `,
})
class HlmTriggerHost {}

@Component({
  imports: [CheckpointTrigger],
  template: `
    <ai-checkpoint-trigger
      [disabled]="disabled()"
      (checkpointRestore)="restoreCount.update((count) => count + 1)"
    >
      Restore element trigger
    </ai-checkpoint-trigger>
  `,
})
class ElementTriggerHost {
  readonly disabled = signal(false);
  readonly restoreCount = signal(0);
}

describe('Checkpoint', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('matches element and attribute usage', () => {
    expect(fixture.componentInstance.checkpoints().length).toBe(2);
    expect(fixture.componentInstance.icons().length).toBe(2);
    expect(fixture.componentInstance.triggers().length).toBe(2);
  });

  it('renders the checkpoint row with default icon, projected label, and separator', () => {
    const element = fixture.nativeElement as HTMLElement;
    const checkpoint = element.querySelector('ai-checkpoint');
    const icon = checkpoint?.querySelector('ai-checkpoint-icon');
    const trigger = checkpoint?.querySelector('button[aiCheckpointTrigger]');
    const separator = checkpoint?.querySelector('[data-ai-checkpoint-separator]');

    expect(checkpoint?.classList).toContain('flex');
    expect(checkpoint?.classList).toContain('text-muted-foreground');
    expect(checkpoint?.classList).toContain('custom-checkpoint');
    expect(icon?.querySelector('ng-icon')).not.toBeNull();
    expect(icon?.classList).toContain('size-4');
    expect(icon?.classList).toContain('custom-icon');
    expect(trigger?.textContent).toContain('Restore checkpoint');
    expect(separator?.getAttribute('aria-hidden')).toBe('true');
    expect(separator?.classList).toContain('ml-2');
    expect(separator?.classList).toContain('bg-border');
  });

  it('supports projected icon content', () => {
    const element = fixture.nativeElement as HTMLElement;
    const customIcon = element.querySelector('span[aiCheckpointIcon]');

    expect(customIcon?.textContent).toContain('Custom marker');
    expect(customIcon?.querySelector('ng-icon')).toBeNull();
  });

  it('sets accessible trigger attributes and emits restore events', () => {
    const element = fixture.nativeElement as HTMLElement;
    const trigger = element.querySelector<HTMLButtonElement>('button[aiCheckpointTrigger]');

    expect(trigger?.getAttribute('type')).toBe('button');
    expect(trigger?.getAttribute('aria-label')).toBe('Restore to checkpoint before tool call');
    expect(trigger?.classList).toContain('custom-trigger');

    trigger?.click();

    expect(fixture.componentInstance.restoreCount()).toBe(1);
  });

  it('keeps HLM button classes when composed with hlmBtn', async () => {
    await TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [HlmTriggerHost],
      })
      .compileComponents();

    const hlmFixture = TestBed.createComponent(HlmTriggerHost);
    hlmFixture.detectChanges();
    await hlmFixture.whenStable();

    const element = hlmFixture.nativeElement as HTMLElement;
    const trigger = element.querySelector('button[aiCheckpointTrigger]');

    expect(trigger?.classList).toContain('group/button');
    expect(trigger?.classList).toContain('text-muted-foreground');
    expect(trigger?.classList).toContain('hover:text-foreground');
  });

  it('supports keyboard activation and disabled state for element triggers', async () => {
    await TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [ElementTriggerHost],
      })
      .compileComponents();

    const elementFixture = TestBed.createComponent(ElementTriggerHost);
    elementFixture.detectChanges();

    const element = elementFixture.nativeElement as HTMLElement;
    const trigger = element.querySelector<HTMLElement>('ai-checkpoint-trigger');

    expect(trigger?.getAttribute('role')).toBe('button');
    expect(trigger?.getAttribute('tabindex')).toBe('0');

    trigger?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    elementFixture.detectChanges();

    expect(elementFixture.componentInstance.restoreCount()).toBe(1);

    elementFixture.componentInstance.disabled.set(true);
    elementFixture.detectChanges();

    expect(trigger?.getAttribute('aria-disabled')).toBe('true');
    expect(trigger?.getAttribute('tabindex')).toBe('-1');

    trigger?.click();

    expect(elementFixture.componentInstance.restoreCount()).toBe(1);
  });
});
