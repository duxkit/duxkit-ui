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
        redirectTo: 'conversation',
      },
      {
        path: ':slug',
        loadComponent: () => import('./docs/component-doc.page').then((m) => m.ComponentDocPage),
      },
    ],
  },
];
