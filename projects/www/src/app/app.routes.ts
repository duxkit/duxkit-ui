import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./routes/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'docs',
    loadComponent: () => import('./routes/docs/docs-shell.page').then((m) => m.DocsShellPage),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./routes/docs/docs-introduction.page').then((m) => m.DocsIntroductionPage),
      },
      {
        path: 'installation',
        loadComponent: () =>
          import('./routes/docs/installation.page').then((m) => m.InstallationPage),
      },
      {
        path: 'cli',
        loadComponent: () => import('./routes/docs/cli.page').then((m) => m.CliPage),
      },
      {
        path: 'changelog',
        loadComponent: () => import('./routes/docs/changelog.page').then((m) => m.ChangelogPage),
      },
    ],
  },
  {
    path: 'components',
    loadComponent: () =>
      import('./routes/components/components-shell.page').then((m) => m.ComponentsShellPage),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./routes/components/component-explore.page').then((m) => m.ComponentExplorePage),
      },
      {
        path: ':slug',
        loadComponent: () =>
          import('./routes/components/component-doc.page').then((m) => m.ComponentDocPage),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./routes/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
