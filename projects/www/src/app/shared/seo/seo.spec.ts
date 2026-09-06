import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { componentDocs } from '../../routes/docs/data/component-docs.registry';
import {
  buildRobotsTxt,
  buildSitemapXml,
  defaultOgImageAlt,
  defaultOgImageHeight,
  defaultOgImagePath,
  defaultOgImageWidth,
  docsComponentRoutePath,
  getSeoPage,
  siteOrigin,
  staticSeoRoutes,
} from './seo';

describe('www SEO configuration', () => {
  it('keeps every component docs page in the static route inventory', () => {
    const expectedDocsRoutes = componentDocs.map((doc) => docsComponentRoutePath(doc.slug));

    expect(staticSeoRoutes).toEqual([
      '/',
      '/docs',
      '/docs/installation',
      '/docs/cli',
      '/docs/migrations',
      '/docs/migrations/v0-4-1-to-v0-4-2',
      '/docs/changelog',
      '/components',
      ...expectedDocsRoutes,
    ]);
  });

  it('provides specific metadata for the home, docs index, and component docs routes', () => {
    expect(getSeoPage('/')).toMatchObject({
      title: 'Duxkit UI - Angular UI primitives for AI SDK apps',
      canonicalPath: '/',
    });
    expect(getSeoPage('/docs')).toMatchObject({
      title: 'Duxkit UI Docs - Introduction',
      canonicalPath: '/docs',
    });
    expect(getSeoPage('/docs/installation')).toMatchObject({
      title: 'Install Duxkit UI - Angular CLI Setup Guide',
      canonicalPath: '/docs/installation',
    });
    expect(getSeoPage('/docs/cli')).toMatchObject({
      title: 'Duxkit UI CLI - Angular Primitive Commands',
      canonicalPath: '/docs/cli',
    });
    expect(getSeoPage('/docs/changelog')).toMatchObject({
      title: 'DuxKit Changelog - WWW, CLI, and UI Updates',
      canonicalPath: '/docs/changelog',
    });
    expect(getSeoPage('/docs/migrations')).toMatchObject({
      title: 'Duxkit UI Migrations - Update Your App',
      canonicalPath: '/docs/migrations',
    });
    expect(getSeoPage('/docs/migrations/v0-4-1-to-v0-4-2')).toMatchObject({
      title: 'Migrate v0.4.1 to v0.4.2 - Duxkit UI',
      canonicalPath: '/docs/migrations/v0-4-1-to-v0-4-2',
    });
    expect(getSeoPage('/components')).toMatchObject({
      title: 'Angular AI Components - Duxkit UI',
      canonicalPath: '/components',
    });
    expect(getSeoPage('/components/conversation')).toMatchObject({
      title: 'Conversation Component - Duxkit UI',
      canonicalPath: '/components/conversation',
    });
    expect(getSeoPage('/missing')).toMatchObject({
      title: 'Page not found - Duxkit UI',
      robots: 'noindex,follow',
    });
  });

  it('builds absolute canonical URLs without duplicate slashes', () => {
    expect(getSeoPage('/components/conversation').canonicalUrl).toBe(
      `${siteOrigin}/components/conversation`,
    );
  });

  it('uses a social preview image with the expected large-card dimensions', () => {
    const publicRoot = join(import.meta.dirname, '../../../../public');
    const ogImage = readFileSync(join(publicRoot, defaultOgImagePath.slice(1)));

    expect(defaultOgImagePath).toBe('/og-image.png');
    expect(defaultOgImageAlt).toBe('Duxkit UI: Angular UI pieces for AI SDK apps.');
    expect(ogImage.readUInt32BE(16)).toBe(defaultOgImageWidth);
    expect(ogImage.readUInt32BE(20)).toBe(defaultOgImageHeight);
    expect(defaultOgImageWidth).toBe(1200);
    expect(defaultOgImageHeight).toBe(630);
  });

  it('keeps social descriptions short enough for preview cards', () => {
    for (const route of staticSeoRoutes) {
      expect(getSeoPage(route).description.length).toBeLessThanOrEqual(125);
    }
  });

  it('builds crawl assets from the same route inventory', () => {
    const sitemap = buildSitemapXml();
    const robots = buildRobotsTxt();

    expect(robots).toContain(`Sitemap: ${siteOrigin}/sitemap.xml`);

    for (const route of staticSeoRoutes) {
      expect(sitemap).toContain(`<loc>${siteOrigin}${route === '/' ? '' : route}</loc>`);
    }
  });

  it('keeps public crawl assets aligned with generated SEO output', () => {
    const publicRoot = join(import.meta.dirname, '../../../../public');

    expect(readFileSync(join(publicRoot, 'robots.txt'), 'utf8')).toBe(buildRobotsTxt());
    expect(readFileSync(join(publicRoot, 'sitemap.xml'), 'utf8')).toBe(buildSitemapXml());
  });
});
