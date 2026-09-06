import {
  componentDocs,
  findComponentDoc,
  type ComponentDocSlug,
} from '../../routes/docs/data/component-docs.registry';
import { componentHref } from '../../routes/docs/data/docs-navigation';
import { migrationGuides, migrationHref } from '../../routes/docs/data/migrations';

export const siteName = 'Duxkit UI';
export const siteOrigin = 'https://duxkit.com';
export const defaultOgImagePath = '/og-image.png';
export const defaultOgImageWidth = 1200;
export const defaultOgImageHeight = 630;
export const defaultOgImageAlt = 'Duxkit UI: Angular UI pieces for AI SDK apps.';

export interface SeoPage {
  readonly title: string;
  readonly description: string;
  readonly canonicalPath: string;
  readonly canonicalUrl: string;
  readonly robots?: string;
  readonly jsonLd: readonly Record<string, unknown>[];
}

export function docsComponentRoutePath(slug: ComponentDocSlug): `/components/${ComponentDocSlug}` {
  return componentHref(slug);
}

export const staticSeoRoutes = [
  '/',
  '/docs',
  '/docs/installation',
  '/docs/cli',
  '/docs/migrations',
  ...migrationGuides.map(migrationHref),
  '/docs/changelog',
  '/components',
  ...componentDocs.map((doc) => docsComponentRoutePath(doc.slug)),
] as const;

export function getSeoPage(path: string): SeoPage {
  if (path === '/') {
    return buildSeoPage({
      canonicalPath: '/',
      title: 'Duxkit UI - Angular UI primitives for AI SDK apps',
      description:
        'Build Angular AI screens with UI pieces for chat, tool calls, reasoning, approvals, files, and generated output.',
      jsonLd: [websiteJsonLd(), softwareSourceCodeJsonLd()],
    });
  }

  if (path === '/docs') {
    return buildSeoPage({
      canonicalPath: '/docs',
      title: 'Duxkit UI Docs - Introduction',
      description:
        'Learn where Duxkit AI fits in an Angular app and what parts of the UI layer it covers.',
      jsonLd: [breadcrumbJsonLd([{ name: 'Docs', path: '/docs' }])],
    });
  }

  if (path === '/docs/installation') {
    return buildSeoPage({
      canonicalPath: '/docs/installation',
      title: 'Install Duxkit UI - Angular CLI Setup Guide',
      description:
        'Use the @duxkit/ui CLI to configure an Angular app and add editable AI UI primitives.',
      jsonLd: [
        breadcrumbJsonLd([
          { name: 'Docs', path: '/docs' },
          { name: 'Installation', path: '/docs/installation' },
        ]),
        techArticleJsonLd(
          'Install Duxkit UI',
          'Use the @duxkit/ui CLI to configure an Angular app and add editable AI UI primitives.',
          '/docs/installation',
        ),
      ],
    });
  }

  if (path === '/docs/cli') {
    return buildSeoPage({
      canonicalPath: '/docs/cli',
      title: 'Duxkit UI CLI - Angular Primitive Commands',
      description:
        'Use the @duxkit/ui CLI to initialize Angular, add primitives, inspect setup, and plan safe changes.',
      jsonLd: [
        breadcrumbJsonLd([
          { name: 'Docs', path: '/docs' },
          { name: 'CLI', path: '/docs/cli' },
        ]),
        techArticleJsonLd(
          'Duxkit UI CLI',
          'Use the @duxkit/ui CLI to initialize Angular, add primitives, inspect setup, and plan safe changes.',
          '/docs/cli',
        ),
      ],
    });
  }

  if (path === '/docs/migrations') {
    return buildSeoPage({
      canonicalPath: path,
      title: 'Duxkit UI Migrations - Update Your App',
      description:
        'Find migration steps, before-and-after examples and checks for updating your Duxkit UI components.',
      jsonLd: [
        breadcrumbJsonLd([
          { name: 'Docs', path: '/docs' },
          { name: 'Migrations', path },
        ]),
      ],
    });
  }

  const migration = migrationGuides.find((guide) => migrationHref(guide) === path);
  if (migration) {
    const title = `Migrate ${migration.fromRelease} to ${migration.toRelease}`;
    return buildSeoPage({
      canonicalPath: path,
      title: `${title} - Duxkit UI`,
      description: migration.description,
      jsonLd: [
        breadcrumbJsonLd([
          { name: 'Docs', path: '/docs' },
          { name: 'Migrations', path: '/docs/migrations' },
          { name: title, path },
        ]),
        {
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: title,
          description: migration.description,
          url: absoluteUrl(path),
        },
      ],
    });
  }

  if (path === '/docs/changelog') {
    return buildSeoPage({
      canonicalPath: '/docs/changelog',
      title: 'DuxKit Changelog - WWW, CLI, and UI Updates',
      description: 'Review the main WWW, CLI, and UI changes included in each DuxKit bundle.',
      jsonLd: [
        breadcrumbJsonLd([
          { name: 'Docs', path: '/docs' },
          { name: 'Changelog', path: '/docs/changelog' },
        ]),
      ],
    });
  }

  if (path === '/components') {
    return buildSeoPage({
      canonicalPath: '/components',
      title: 'Angular AI Components - Duxkit UI',
      description:
        'Browse Angular UI components for AI SDK chat, tools, approvals, sources, files, and generated output.',
      jsonLd: [breadcrumbJsonLd([{ name: 'Components', path: '/components' }])],
    });
  }

  const componentSlug = componentSlugFromPath(path);
  const componentDoc = componentSlug ? findComponentDoc(componentSlug) : undefined;

  if (componentDoc) {
    const canonicalPath = docsComponentRoutePath(componentDoc.slug);

    return buildSeoPage({
      canonicalPath,
      title: `${componentDoc.title} Component - Duxkit UI`,
      description: `${componentDoc.description} Built for Angular AI apps.`,
      jsonLd: [
        breadcrumbJsonLd([
          { name: 'Components', path: '/components' },
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
  return ['User-agent: *', 'Allow: /', '', `Sitemap: ${absoluteUrl('/sitemap.xml')}`, ''].join(
    '\n',
  );
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
  const match = /^\/components\/([^/]+)$/.exec(path);

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
  const itemListElement = [{ name: 'Home', path: '/' }, ...items].map((item, index) => ({
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
