import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { CodeBlock } from './code-block';
import { CodeBlockContent, CodeBlockCopy } from './code-block-parts';

const meta: Meta<CodeBlock> = {
  title: 'Components/Code Block',
  decorators: [moduleMetadata({ imports: [CodeBlock, CodeBlockContent, CodeBlockCopy] })],
  component: CodeBlock,
  tags: ['autodocs'],
  argTypes: {
    language: {
      control: 'select',
      options: ['ts', 'html', 'css', 'json', 'bash', 'text'],
    },
  },
  args: {
    language: 'ts',
    code: `import { Component, signal } from '@angular/core';

@Component({
  selector: 'example-counter',
  template: '<button (click)="count.update(value => value + 1)">{{ count() }}</button>',
})
export class ExampleCounter {
  protected readonly count = signal(0);
}`,
  },
};

export default meta;
type Story = StoryObj<CodeBlock>;

export const TypeScript: Story = {};

export const Json: Story = {
  args: {
    language: 'json',
    code: `{
  "tool": "getWeather",
  "state": "output-available",
  "output": {
    "temperature": 24,
    "condition": "partly cloudy"
  }
}`,
  },
};

export const Composed: Story = {
  render: (args) => ({
    props: args,
    template: `<ai-code-block [code]="code" [language]="language">
      <button aiCodeBlockCopy>Copy code</button>
      <ai-code-block-content />
      <p class="text-muted-foreground text-xs">Consumer-owned footer</p>
    </ai-code-block>`,
  }),
};
