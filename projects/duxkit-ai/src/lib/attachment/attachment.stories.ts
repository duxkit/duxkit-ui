import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import type { FileUIPart, SourceDocumentUIPart } from 'ai';
import { Attachment, AttachmentPreview, AttachmentRemove, Attachments } from './';

type AttachmentStoryPart = FileUIPart | SourceDocumentUIPart;

const attachmentParts: readonly AttachmentStoryPart[] = [
  {
    type: 'file',
    mediaType: 'image/jpeg',
    filename: 'mountain-landscape.jpg',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=640&q=80',
  },
  {
    type: 'file',
    mediaType: 'application/pdf',
    filename: 'quarterly-report.pdf',
    url: 'https://example.com/quarterly-report.pdf',
  },
  {
    type: 'file',
    mediaType: 'video/mp4',
    filename: 'product-demo.mp4',
    url: 'https://example.com/product-demo.mp4',
  },
  {
    type: 'source-document',
    sourceId: 'react-docs',
    mediaType: 'text/html',
    title: 'React Documentation',
    filename: 'react-documentation.html',
  },
  {
    type: 'file',
    mediaType: 'audio/mpeg',
    filename: 'podcast-episode.mp3',
    url: 'https://example.com/podcast-episode.mp3',
  },
];

const meta: Meta = {
  title: 'Components/Attachment',
  decorators: [
    moduleMetadata({
      imports: [Attachment, AttachmentPreview, AttachmentRemove, Attachments],
    }),
  ],
  tags: ['autodocs'],
  args: {
    attachments: attachmentParts,
    variant: 'grid',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['grid', 'inline', 'list'],
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <ai-attachments class="w-[640px]" [variant]="variant">
        @for (attachment of attachments; track attachment.filename ?? attachment.sourceId) {
          <ai-attachment [data]="attachment">
            @if (variant === 'inline') {
              <ai-attachment-preview>
                <button aiAttachmentRemove></button>
              </ai-attachment-preview>
            } @else {
              <ai-attachment-preview />
              <button aiAttachmentRemove></button>
            }
          </ai-attachment>
        }
      </ai-attachments>
    `,
  }),
};

export default meta;
type Story = StoryObj;

export const Grid: Story = {};

export const Inline: Story = {
  args: {
    variant: 'inline',
  },
};

export const List: Story = {
  args: {
    variant: 'list',
  },
};
