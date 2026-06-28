import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./pages/home.page').then((m) => m.HomePage),
  },
  {
    path: 'docs/components',
    loadComponent: () => import('./docs/docs-shell.page').then((m) => m.DocsShellPage),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./docs/component-explore.page').then((m) => m.ComponentExplorePage),
      },
      {
        path: ':slug',
        loadComponent: () => import('./docs/component-doc.page').then((m) => m.ComponentDocPage),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found.page').then((m) => m.NotFoundPage),
  },
];
