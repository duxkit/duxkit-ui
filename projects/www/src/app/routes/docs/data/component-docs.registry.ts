export interface ComponentDocLink {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
}

export const componentDocs = [
  {
    slug: 'conversation',
    title: 'Conversation',
    description: 'A scrollable container for chat transcripts and streaming messages.',
  },
  {
    slug: 'message',
    title: 'Message',
    description: 'Render user, assistant, and system messages with role-aware structure.',
  },
  {
    slug: 'checkpoint',
    title: 'Checkpoint',
    description: 'Mark restore points so users can return to an earlier chat state.',
  },
  {
    slug: 'context',
    title: 'Context',
    description: 'Show context usage, token breakdowns, and estimated model cost.',
  },
  {
    slug: 'model-selector',
    title: 'Model Selector',
    description: 'Let users search and choose models grouped by provider.',
  },
  {
    slug: 'prompt-input',
    title: 'Prompt Input',
    description: 'Build a prompt form with a textarea, attachments, model tools, and submit state.',
  },
  {
    slug: 'queue',
    title: 'Queue',
    description: 'List pending work such as messages, tasks, uploads, and file changes.',
  },
  {
    slug: 'attachment',
    title: 'Attachment',
    description: 'Preview files and source documents from AI SDK message parts.',
  },
  {
    slug: 'chain-of-thought',
    title: 'Chain of Thought',
    description: 'Show expandable progress steps for reasoning, searches, and intermediate work.',
  },
  {
    slug: 'task',
    title: 'Task',
    description: 'Show agent activity, checklist progress, and file updates.',
  },
  {
    slug: 'tool',
    title: 'Tool',
    description: 'Render AI SDK tool calls, inputs, results, and state changes.',
  },
  {
    slug: 'reasoning',
    title: 'Reasoning',
    description: 'Reveal summarized reasoning in a collapsible markdown panel.',
  },
  {
    slug: 'sources',
    title: 'Sources',
    description: 'Group the source links and references behind an expandable trigger.',
  },
  {
    slug: 'confirmation',
    title: 'Confirmation',
    description: 'Ask for user approval before an agent takes an action.',
  },
  {
    slug: 'code-block',
    title: 'Code Block',
    description: 'Display syntax-highlighted code with copy behavior.',
  },
  {
    slug: 'shimmer',
    title: 'Shimmer',
    description: 'Use animated text for loading states and progressive model output.',
  },
] as const satisfies readonly ComponentDocLink[];

export type ComponentDoc = (typeof componentDocs)[number];
export type ComponentDocSlug = ComponentDoc['slug'];

export function findComponentDoc(slug: string): ComponentDoc | undefined {
  return componentDocs.find((doc) => doc.slug === slug);
}
