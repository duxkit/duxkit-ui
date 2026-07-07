import { describe, expect, it } from 'vitest';
import { componentDocs } from '../../routes/docs/data/component-docs.registry';
import { footerAllComponentsLink, footerLinkGroups } from './footer-link-groups';

describe('footer link groups', () => {
  it('groups every component doc exactly once', () => {
    const groupedSlugs = footerLinkGroups.flatMap((group) =>
      group.links.flatMap((link) => (link.slug ? [link.slug] : [])),
    );

    expect(groupedSlugs).toEqual([
      'conversation',
      'message',
      'prompt-input',
      'attachment',
      'sources',
      'task',
      'tool',
      'queue',
      'confirmation',
      'checkpoint',
      'reasoning',
      'chain-of-thought',
      'context',
      'model-selector',
      'code-block',
      'shimmer',
    ]);
    expect(new Set(groupedSlugs).size).toBe(groupedSlugs.length);
    expect(groupedSlugs.toSorted()).toEqual(componentDocs.map((doc) => doc.slug).toSorted());
  });

  it('uses component routes for component links', () => {
    const conversation = footerLinkGroups
      .flatMap((group) => group.links)
      .find((link) => link.slug === 'conversation');

    expect(conversation).toEqual({
      slug: 'conversation',
      title: 'Conversation',
      route: ['/components', 'conversation'],
    });
    expect(footerAllComponentsLink).toEqual({
      title: 'All components',
      route: ['/components'],
    });
  });

  it('keeps approved group headings stable', () => {
    expect(footerLinkGroups.map((group) => group.title)).toEqual([
      'Chat',
      'Agent',
      'Thinking',
      'Output',
    ]);
  });
});
