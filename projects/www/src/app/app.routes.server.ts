import { PrerenderFallback, RenderMode, type ServerRoute } from '@angular/ssr';
import { componentDocs } from './docs/component-docs.registry';

export const appServerRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'docs/components',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'docs/components/:slug',
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
