import '@angular/compiler';
import { describe, expect, it } from 'vitest';
import { appServerRoutes } from '../../app.routes.server';
import { componentDocs } from './data/component-docs.registry';
import { docsPages } from './data/docs-navigation';
import { getSeoPage, staticSeoRoutes } from '../../shared/seo/seo';
import {
  migrationForComponent,
  migrationForRelease,
  migrationGuides,
  migrationHref,
} from './data/migrations';

describe('migration guide navigation', () => {
  it('links only the new release to its guide and keeps npm versions distinct', () => {
    expect(migrationForRelease('v0.4.2')).toMatchObject({
      fromRelease: 'v0.4.1',
      toRelease: 'v0.4.2',
      fromCli: '0.1.0',
      toCli: '0.2.0',
    });
    expect(migrationForRelease('v0.4.1')).toBeUndefined();
    expect(migrationForRelease('0.2.0')).toBeUndefined();
  });

  it('resolves component links to unique sections in an existing guide', () => {
    for (const doc of componentDocs) {
      const target = migrationForComponent(doc.slug);
      expect(target, doc.slug).toBeDefined();
      expect(target?.guide.steps.filter((step) => step.id === target.fragment)).toHaveLength(1);
      expect(staticSeoRoutes).toContain(migrationHref(target!.guide));
    }
    for (const guide of migrationGuides) {
      const anchors = [
        'who-needs-this',
        'update-safely',
        'check-your-app',
        ...guide.steps.map((step) => step.id),
      ];
      expect(new Set(anchors).size).toBe(anchors.length);
    }
  });

  it('makes each guide reachable through navigation, prerendering and SEO', async () => {
    expect(docsPages.find((page) => page.slug === 'migrations')?.href).toBe('/docs/migrations');
    const route = appServerRoutes.find((route) => route.path === 'docs/migrations/:slug');
    expect(route).toBeDefined();
    const params =
      route && 'getPrerenderParams' in route ? await route.getPrerenderParams?.() : undefined;
    for (const guide of migrationGuides) {
      expect(params).toContainEqual({ slug: guide.slug });
      const seo = getSeoPage(migrationHref(guide));
      expect(seo.canonicalPath).toBe(migrationHref(guide));
      expect(seo.title).toContain(`${guide.fromRelease} to ${guide.toRelease}`);
      expect(seo.robots ?? 'index,follow').not.toContain('noindex');
    }
    expect(getSeoPage('/docs/migrations/unknown').robots).toContain('noindex');
  });
});
