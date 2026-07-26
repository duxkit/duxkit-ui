import { type ComponentDocSlug, componentDocs } from './component-docs.registry';

export type SiteSection = 'docs' | 'components';

export const docsPages = [
  {
    slug: 'introduction',
    title: 'Introduction',
    description: 'What Duxkit AI provides and where it fits in an Angular app.',
    href: '/docs',
  },
  {
    slug: 'installation',
    title: 'Installation',
    description: 'Use the @duxkit/ui CLI to configure Angular and add editable primitives.',
    href: '/docs/installation',
  },
  {
    slug: 'cli',
    title: 'CLI',
    description: 'Use init, add, list, and inspect to manage editable Duxkit UI primitives.',
    href: '/docs/cli',
  },
  {
    slug: 'changelog',
    title: 'Changelog',
    description: 'Review the main WWW, CLI, and UI changes included in each bundle.',
    href: '/docs/changelog',
  },
] as const;

export const topLevelSections = [
  { section: 'docs', label: 'Docs', href: '/docs' },
  { section: 'components', label: 'Components', href: '/components' },
] as const;

export const componentSidebarGroup = {
  title: 'Components',
  items: componentDocs,
} as const;

export function getSectionForPath(path: string): SiteSection | undefined {
  if (path === '/docs' || path.startsWith('/docs/')) {
    return 'docs';
  }

  if (path === '/components' || path.startsWith('/components/')) {
    return 'components';
  }

  return undefined;
}

export function componentHref(slug: ComponentDocSlug): `/components/${ComponentDocSlug}` {
  return `/components/${slug}`;
}
