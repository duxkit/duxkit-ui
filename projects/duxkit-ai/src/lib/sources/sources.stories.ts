import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { Source, Sources, SourcesContent, SourcesTrigger } from './';

const sources = [
  {
    href: 'https://docs.stripe.com/api',
    title: 'Stripe API Documentation',
  },
  {
    href: 'https://docs.github.com/en/rest',
    title: 'GitHub REST API',
  },
  {
    href: 'https://docs.aws.amazon.com/sdk-for-javascript',
    title: 'AWS SDK for JavaScript',
  },
];

const meta: Meta = {
  title: 'Components/Sources',
  decorators: [
    moduleMetadata({
      imports: [Source, Sources, SourcesContent, SourcesTrigger],
    }),
  ],
  tags: ['autodocs'],
  args: {
    sources,
  },
  render: (args) => ({
    props: args,
    template: `
      <ai-sources [expanded]="true">
        <button aiSourcesTrigger [count]="sources.length"></button>
        <ai-sources-content>
          @for (source of sources; track source.href) {
            <a aiSource [href]="source.href" [title]="source.title"></a>
          }
        </ai-sources-content>
      </ai-sources>
    `,
  }),
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const CustomTrigger: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ai-sources [expanded]="true">
        <button aiSourcesTrigger [count]="sources.length">
          <span class="font-medium">References</span>
        </button>
        <ai-sources-content>
          @for (source of sources; track source.href) {
            <a aiSource [href]="source.href" [title]="source.title"></a>
          }
        </ai-sources-content>
      </ai-sources>
    `,
  }),
};
