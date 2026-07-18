import { PrerenderFallback, RenderMode, type ServerRoute } from '@angular/ssr';
import { componentDocs } from './routes/docs/data/component-docs.registry';

export const appServerRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'docs',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'docs/installation',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'docs/changelog',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'components',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'components/:slug',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.None,
    async getPrerenderParams() {
      return componentDocs.map((doc) => ({ slug: doc.slug }));
    },
  },
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
