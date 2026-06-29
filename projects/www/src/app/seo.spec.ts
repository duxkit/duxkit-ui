import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { componentDocs } from './docs/component-docs.registry';
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

    expect(staticSeoRoutes).toEqual(['/', '/docs/components', ...expectedDocsRoutes]);
  });

  it('provides specific metadata for the home, docs index, and component docs routes', () => {
    expect(getSeoPage('/')).toMatchObject({
      title: 'Duxkit UI - Angular primitives for AI SDK interfaces',
      canonicalPath: '/',
    });
    expect(getSeoPage('/docs/components')).toMatchObject({
      title: 'Angular AI Components - Duxkit UI',
      canonicalPath: '/docs/components',
    });
    expect(getSeoPage('/docs/components/conversation')).toMatchObject({
      title: 'Conversation Component - Duxkit UI',
      canonicalPath: '/docs/components/conversation',
    });
    expect(getSeoPage('/missing')).toMatchObject({
      title: 'Page not found - Duxkit UI',
      robots: 'noindex,follow',
    });
  });

  it('builds absolute canonical URLs without duplicate slashes', () => {
    expect(getSeoPage('/docs/components/conversation').canonicalUrl).toBe(
      `${siteOrigin}/docs/components/conversation`,
    );
  });

  it('uses a social preview image with the expected large-card dimensions', () => {
    const publicRoot = join(import.meta.dirname, '../../public');
    const ogImage = readFileSync(join(publicRoot, defaultOgImagePath.slice(1)));

    expect(defaultOgImagePath).toBe('/og-image.png');
    expect(defaultOgImageAlt).toBe('Duxkit UI: Angular AI SDK primitives.');
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
    const publicRoot = join(import.meta.dirname, '../../public');

    expect(readFileSync(join(publicRoot, 'robots.txt'), 'utf8')).toBe(buildRobotsTxt());
    expect(readFileSync(join(publicRoot, 'sitemap.xml'), 'utf8')).toBe(buildSitemapXml());
  });
});
