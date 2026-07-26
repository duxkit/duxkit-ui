import { describe, expect, it } from 'vitest';
import { appRoutes } from './app.routes';

describe('www app routes', () => {
  it('splits docs and components into top-level route sections', () => {
    const docsRoute = appRoutes.find((route) => route.path === 'docs');
    const componentsRoute = appRoutes.find((route) => route.path === 'components');

    expect(docsRoute).toBeDefined();
    expect(componentsRoute).toBeDefined();
    expect(appRoutes.find((route) => route.path === 'docs/components')).toBeUndefined();
    expect(docsRoute?.children?.[0]?.path).toBe('');
    expect(docsRoute?.children?.map((route) => route.path)).toEqual([
      '',
      'installation',
      'cli',
      'changelog',
    ]);
    expect(componentsRoute?.children?.map((route) => route.path)).toEqual(['', ':slug']);
  });
});
