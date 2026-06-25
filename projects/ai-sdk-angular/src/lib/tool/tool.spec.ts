import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { AiToolPart } from './tool';
import { Tool } from './tool';
import { ToolContent } from './tool-content';
import { ToolStatus } from './tool-status';
import { ToolTrigger } from './tool-trigger';

const toolPart: AiToolPart = {
  type: 'tool-getWeather',
  toolCallId: 'call-1',
  state: 'output-available',
  input: {
    city: 'London',
    unit: 'celsius',
  },
  output: {
    city: 'London',
    unit: 'celsius',
    temperature: 23,
  },
};

@Component({
  imports: [Tool, ToolTrigger, ToolContent],
  template: `
    <ai-tool [part]="part()" class="custom-tool">
      <button aiToolTrigger class="custom-trigger"></button>
      <ai-tool-content class="custom-content" />
    </ai-tool>
  `,
})
class Host {
  readonly part = signal(toolPart);
  readonly tool = viewChild.required(Tool);
}

@Component({
  imports: [Tool, ToolTrigger, ToolStatus],
  template: `
    <ai-tool [part]="part()">
      <button aiToolTrigger>
        <span>Custom trigger</span>
        <ai-tool-status variant="icon" class="custom-status" />
      </button>
    </ai-tool>
  `,
})
class CustomTriggerHost {
  readonly part = signal(toolPart);
}

describe('Tool', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('derives the tool name, state, and json from the tool part', () => {
    const tool = fixture.componentInstance.tool();

    expect(tool.name()).toBe('getWeather');
    expect(tool.state()).toBe('output-available');
    expect(tool.statusLabel()).toBe('output available');
    expect(tool.json()).toContain('"city": "London"');
  });

  it('renders the default trigger and content', () => {
    const element = fixture.nativeElement as HTMLElement;
    const status = element.querySelector('ai-tool-status');

    expect(element.querySelector('button[aitooltrigger]')?.textContent).toContain('getWeather');
    expect(status?.textContent).toContain('output available');
    expect(status?.getAttribute('data-variant')).toBe('badge');
    expect(element.querySelector('ai-tool-content')?.textContent).toContain('"temperature": 23');
  });

  it('supports projected trigger content with icon-only status', async () => {
    const customFixture = TestBed.createComponent(CustomTriggerHost);
    customFixture.detectChanges();
    await customFixture.whenStable();

    const element = customFixture.nativeElement as HTMLElement;
    const status = element.querySelector('ai-tool-status');

    expect(element.querySelector('button[aitooltrigger]')?.textContent).toContain('Custom trigger');
    expect(status?.textContent?.trim()).toBe('');
    expect(status?.getAttribute('data-variant')).toBe('icon');
    expect(status?.getAttribute('aria-label')).toBe('Tool status: output available');
    expect(status?.classList).toContain('custom-status');
    expect(status?.querySelector('ng-icon')).not.toBeNull();
  });

  it('applies default classes and preserves consumer classes', () => {
    const element = fixture.nativeElement as HTMLElement;
    const tool = element.querySelector('ai-tool');
    const trigger = element.querySelector('button[aitooltrigger]');
    const content = element.querySelector('ai-tool-content');

    expect(tool?.classList).toContain('border');
    expect(tool?.classList).toContain('custom-tool');
    expect(trigger?.classList).toContain('w-full');
    expect(trigger?.classList).toContain('custom-trigger');
    expect(content?.classList).toContain('data-[state=closed]:hidden');
    expect(content?.classList).toContain('custom-content');
  });
});
