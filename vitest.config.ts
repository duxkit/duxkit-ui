import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const helmAlias = (name: string) => resolve(__dirname, `projects/ui/helm/${name}/src/index.ts`);

export default defineConfig({
  resolve: {
    alias: [
      { find: '@duxkit-private/ui/helm/accordion', replacement: helmAlias('accordion') },
      { find: '@duxkit-private/ui/helm/button', replacement: helmAlias('button') },
      { find: '@duxkit-private/ui/helm/command', replacement: helmAlias('command') },
      { find: '@duxkit-private/ui/helm/dialog', replacement: helmAlias('dialog') },
      { find: '@duxkit-private/ui/helm/drawer', replacement: helmAlias('drawer') },
      { find: '@duxkit-private/ui/helm/icon', replacement: helmAlias('icon') },
      { find: '@duxkit-private/ui/helm/input', replacement: helmAlias('input') },
      { find: '@duxkit-private/ui/helm/input-group', replacement: helmAlias('input-group') },
      { find: '@duxkit-private/ui/helm/navigation-menu', replacement: helmAlias('navigation-menu') },
      { find: '@duxkit-private/ui/helm/tabs', replacement: helmAlias('tabs') },
      { find: '@duxkit-private/ui/helm/textarea', replacement: helmAlias('textarea') },
      { find: '@duxkit-private/ui/helm/utils', replacement: helmAlias('utils') },
      {
        find: /^duxkit-ai\/(.+)$/,
        replacement: resolve(__dirname, 'projects/duxkit-ai/src/lib/$1.entrypoint.ts'),
      },
      { find: 'duxkit-ai', replacement: resolve(__dirname, 'projects/duxkit-ai/src/public-api.ts') },
      { find: '@duxkit-private/ui', replacement: resolve(__dirname, 'projects/ui/src/index.ts') },
    ],
  },
});
