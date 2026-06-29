export interface ComponentDocLink {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
}

export const componentDocs = [
  {
    slug: 'conversation',
    title: 'Conversation',
    description: 'Scrollable conversation container for AI SDK message streams.',
  },
  {
    slug: 'message',
    title: 'Message',
    description: 'Role-aware message primitives for user, assistant, and system output.',
  },
  {
    slug: 'checkpoint',
    title: 'Checkpoint',
    description: 'Conversation restore point primitive for reverting to earlier chat state.',
  },
  {
    slug: 'context',
    title: 'Context',
    description: 'Context window usage, token breakdown, and model cost estimate primitives.',
  },
  {
    slug: 'attachment',
    title: 'Attachment',
    description: 'Composable file and source-document previews for AI SDK message parts.',
  },
  {
    slug: 'chain-of-thought',
    title: 'Chain of Thought',
    description: 'Expandable reasoning and progress steps for AI work.',
  },
  {
    slug: 'task',
    title: 'Task',
    description: 'Task activity primitives for agent work and file updates.',
  },
  {
    slug: 'tool',
    title: 'Tool',
    description: 'Tool call display primitives for AI SDK tool parts.',
  },
  {
    slug: 'reasoning',
    title: 'Reasoning',
    description: 'Collapsible markdown reasoning content.',
  },
  {
    slug: 'sources',
    title: 'Sources',
    description: 'Collapsible source references for AI responses.',
  },
  {
    slug: 'confirmation',
    title: 'Confirmation',
    description: 'Approval request primitives for user-controlled actions.',
  },
  {
    slug: 'code-block',
    title: 'Code Block',
    description: 'Syntax highlighted code output with copy behavior.',
  },
  {
    slug: 'shimmer',
    title: 'Shimmer',
    description: 'Animated text shimmer for loading states and progressive AI output.',
  },
] as const satisfies readonly ComponentDocLink[];

export type ComponentDoc = (typeof componentDocs)[number];
export type ComponentDocSlug = ComponentDoc['slug'];

export function findComponentDoc(slug: string): ComponentDoc | undefined {
  return componentDocs.find((doc) => doc.slug === slug);
}
