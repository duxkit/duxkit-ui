import type { Meta, StoryObj } from '@storybook/angular';
import { CodeBlock } from './code-block';

const meta: Meta<CodeBlock> = {
  title: 'Components/Code Block',
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
