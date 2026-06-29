import {
  type ComponentDoc,
  type ComponentDocSlug,
  componentDocs,
} from './docs/component-docs.registry';

export interface FooterComponentLink {
  readonly slug?: ComponentDocSlug;
  readonly title: string;
  readonly route: readonly string[];
}

export interface FooterLinkGroup {
  readonly title: string;
  readonly links: readonly FooterComponentLink[];
}

const footerComponentGroups = [
  {
    title: 'Chat',
    slugs: ['conversation', 'message', 'attachment', 'sources'],
  },
  {
    title: 'Agent',
    slugs: ['task', 'tool', 'confirmation', 'checkpoint'],
  },
  {
    title: 'Thinking',
    slugs: ['reasoning', 'chain-of-thought', 'context'],
  },
  {
    title: 'Output',
    slugs: ['code-block', 'shimmer'],
  },
] as const satisfies readonly {
  readonly title: string;
  readonly slugs: readonly ComponentDocSlug[];
}[];

const componentDocsBySlug = new Map<ComponentDocSlug, ComponentDoc>(
  componentDocs.map((doc) => [doc.slug, doc]),
);

export const footerAllComponentsLink = {
  title: 'All components',
  route: ['/docs/components'],
} as const satisfies FooterComponentLink;

export const footerLinkGroups = footerComponentGroups.map((group) => ({
  title: group.title,
  links:
    group.title === 'Output'
      ? [...group.slugs.map(componentLinkForSlug), footerAllComponentsLink]
      : group.slugs.map(componentLinkForSlug),
})) satisfies readonly FooterLinkGroup[];

function componentLinkForSlug(slug: ComponentDocSlug): FooterComponentLink {
  const doc = componentDocsBySlug.get(slug);

  if (!doc) {
    throw new Error(`Footer component group references unknown component doc slug: ${slug}`);
  }

  return {
    slug: doc.slug,
    title: doc.title,
    route: ['/docs/components', doc.slug],
  };
}
