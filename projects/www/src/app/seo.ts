import { componentDocs, findComponentDoc, type ComponentDocSlug } from './docs/component-docs.registry';

export const siteName = 'Duxkit UI';
export const siteOrigin = 'https://duxkit.pages.dev';
export const defaultOgImagePath = '/duxkit_logo.png';

export interface SeoPage {
  readonly title: string;
  readonly description: string;
  readonly canonicalPath: string;
  readonly canonicalUrl: string;
  readonly robots?: string;
  readonly jsonLd: readonly Record<string, unknown>[];
}

export function docsComponentRoutePath(slug: ComponentDocSlug): `/docs/components/${ComponentDocSlug}` {
  return `/docs/components/${slug}`;
}

export const staticSeoRoutes = [
  '/',
  '/docs/components',
  ...componentDocs.map((doc) => docsComponentRoutePath(doc.slug)),
] as const;

export function getSeoPage(path: string): SeoPage {
  if (path === '/') {
    return buildSeoPage({
      canonicalPath: '/',
      title: 'Duxkit UI - Angular primitives for AI SDK interfaces',
      description:
        'Duxkit UI provides Angular primitives for AI SDK chat, agent workflows, tool calls, reasoning, approvals, and generated output.',
      jsonLd: [websiteJsonLd(), softwareSourceCodeJsonLd()],
    });
  }

  if (path === '/docs/components') {
    return buildSeoPage({
      canonicalPath: '/docs/components',
      title: 'Angular AI Components - Duxkit UI',
      description:
        'Explore Duxkit UI component primitives for building Angular AI SDK interfaces, chat surfaces, agent workflows, and generated output.',
      jsonLd: [breadcrumbJsonLd([{ name: 'Components', path: '/docs/components' }])],
    });
  }

  const componentSlug = componentSlugFromPath(path);
  const componentDoc = componentSlug ? findComponentDoc(componentSlug) : undefined;

  if (componentDoc) {
    const canonicalPath = docsComponentRoutePath(componentDoc.slug);

    return buildSeoPage({
      canonicalPath,
      title: `${componentDoc.title} Component - Duxkit UI`,
      description: `${componentDoc.description} Learn the Angular selectors, API, anatomy, and examples for the ${componentDoc.title} primitive.`,
      jsonLd: [
        breadcrumbJsonLd([
          { name: 'Components', path: '/docs/components' },
          { name: componentDoc.title, path: canonicalPath },
        ]),
        techArticleJsonLd(componentDoc.title, componentDoc.description, canonicalPath),
      ],
    });
  }

  return buildSeoPage({
    canonicalPath: path.startsWith('/') ? path : `/${path}`,
    title: 'Page not found - Duxkit UI',
    description: 'The requested Duxkit UI page could not be found.',
    robots: 'noindex,follow',
    jsonLd: [],
  });
}

export function buildSitemapXml(): string {
  const urls = staticSeoRoutes
    .map((route) => {
      const page = getSeoPage(route);

      return [
        '  <url>',
        `    <loc>${page.canonicalUrl}</loc>`,
        '    <changefreq>weekly</changefreq>',
        route === '/' ? '    <priority>1.0</priority>' : '    <priority>0.8</priority>',
        '  </url>',
      ].join('\n');
    })
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
    '',
  ].join('\n');
}

export function buildRobotsTxt(): string {
  return ['User-agent: *', 'Allow: /', '', `Sitemap: ${absoluteUrl('/sitemap.xml')}`, ''].join('\n');
}

function buildSeoPage(input: Omit<SeoPage, 'canonicalUrl'>): SeoPage {
  return {
    ...input,
    canonicalUrl: absoluteUrl(input.canonicalPath),
  };
}

export function absoluteUrl(path: string): string {
  const normalizedPath = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;

  return `${siteOrigin}${normalizedPath}`;
}

function componentSlugFromPath(path: string): string | undefined {
  const match = /^\/docs\/components\/([^/]+)$/.exec(path);

  return match?.[1];
}

function websiteJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteOrigin,
  };
}

function softwareSourceCodeJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: siteName,
    programmingLanguage: 'TypeScript',
    runtimePlatform: 'Angular',
    url: siteOrigin,
  };
}

function techArticleJsonLd(
  title: string,
  description: string,
  canonicalPath: string,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: `${title} Component`,
    description,
    url: absoluteUrl(canonicalPath),
    about: ['Angular', 'AI SDK', title],
  };
}

function breadcrumbJsonLd(
  items: readonly { readonly name: string; readonly path: string }[],
): Record<string, unknown> {
  const itemListElement = [
    { name: 'Home', path: '/' },
    ...items,
  ].map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  };
}
