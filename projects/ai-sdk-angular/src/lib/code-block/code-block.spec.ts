import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeBlock } from './code-block';

@Component({
  imports: [CodeBlock],
  template: '<ai-code-block [code]="code()" language="ts" class="custom-code" />',
})
class Host {
  readonly code = signal('const value = signal("hello");');
}

describe('CodeBlock', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders highlighted code with line numbers and actions', () => {
    const element = fixture.nativeElement as HTMLElement;
    const codeBlock = element.querySelector('ai-code-block');
    const copyButton = element.querySelector('button[aria-label="Copy code"]');
    const downloadButton = element.querySelector('button[aria-label="Download code"]');

    expect(codeBlock?.classList).toContain('ai-code-block');
    expect(codeBlock?.classList).toContain('custom-code');
    expect(codeBlock?.getAttribute('data-language')).toBe('ts');
    expect(element.querySelector('.ai-code-block-language')?.textContent).toBe('ts');
    expect(element.querySelector('code.language-ts')).not.toBeNull();
    expect(element.querySelector('.ai-code-line-number')?.textContent).toBe('1');
    expect(element.querySelector('.hljs-keyword')?.textContent).toBe('const');
    expect(copyButton).not.toBeNull();
    expect(downloadButton).not.toBeNull();
  });
});
