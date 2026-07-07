import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const helmAlias = (name: string) => resolve(__dirname, `projects/ui/helm/${name}/src/index.ts`);

export default defineConfig({
  resolve: {
    alias: [
      { find: '@duxkit/ui/helm/button', replacement: helmAlias('button') },
      { find: '@duxkit/ui/helm/command', replacement: helmAlias('command') },
      { find: '@duxkit/ui/helm/dialog', replacement: helmAlias('dialog') },
      { find: '@duxkit/ui/helm/icon', replacement: helmAlias('icon') },
      { find: '@duxkit/ui/helm/input', replacement: helmAlias('input') },
      { find: '@duxkit/ui/helm/input-group', replacement: helmAlias('input-group') },
      { find: '@duxkit/ui/helm/navigation-menu', replacement: helmAlias('navigation-menu') },
      { find: '@duxkit/ui/helm/tabs', replacement: helmAlias('tabs') },
      { find: '@duxkit/ui/helm/textarea', replacement: helmAlias('textarea') },
      { find: '@duxkit/ui/helm/utils', replacement: helmAlias('utils') },
      {
        find: /^duxkit-ai\/(.+)$/,
        replacement: resolve(__dirname, 'projects/duxkit-ai/src/lib/$1.entrypoint.ts'),
      },
      { find: 'duxkit-ai', replacement: resolve(__dirname, 'projects/duxkit-ai/src/public-api.ts') },
      { find: '@duxkit/ui', replacement: resolve(__dirname, 'projects/ui/src/index.ts') },
    ],
  },
});
