import { mkdir } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { diffSnapshots, withCliFixtureWorkspace } from './cli-fixture-harness.js';

describe('CLI fixture harness', () => {
  it('copies Angular CLI app fixtures to a temporary workspace and runs commands inside them', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      const result = await workspace.run(['inspect', '--json']);
      const parsed = JSON.parse(result.stdout) as {
        readonly componentDestination: string | null;
        readonly packageManager: { readonly name: string };
        readonly project: { readonly name: string; readonly sourceRoot: string } | null;
        readonly stylesheet: string | null;
        readonly styleLanguage: string;
        readonly tailwind: { readonly sourceCoverage: string; readonly v4Imports: boolean };
        readonly type: string;
      };

      result.assertExitCode(0);
      expect(result.stderr).toBe('');
      expect(parsed.type).toBe('angular-cli');
      expect(parsed.project).toEqual(expect.objectContaining({ name: 'fixture-app', sourceRoot: 'src' }));
      expect(parsed.stylesheet).toBe('src/styles.css');
      expect(parsed.styleLanguage).toBe('css');
      expect(parsed.componentDestination).toBe('src/app/components/ai');
      expect(parsed.packageManager.name).toBe('unknown');
      expect(parsed.tailwind).toEqual(
        expect.objectContaining({ sourceCoverage: 'missing', v4Imports: false }),
      );
      result.assertSourceFixtureUnchanged();

      expect(workspace.root).not.toBe(workspace.sourceFixtureRoot);
      expect(await workspace.readText('angular.json')).toContain('"fixture-app"');
    });
  });

  it('copies Nx workspace fixtures to a temporary workspace and runs commands inside them', async () => {
    await withCliFixtureWorkspace('nx-workspace', async (workspace) => {
      const result = await workspace.run(['inspect', '--json']);
      const parsed = JSON.parse(result.stdout) as {
        readonly componentDestination: string | null;
        readonly project: { readonly name: string; readonly sourceRoot: string } | null;
        readonly stylesheet: string | null;
        readonly type: string;
      };

      result.assertExitCode(0);
      result.assertSourceFixtureUnchanged();

      expect(await workspace.readText('nx.json')).toContain('"npmScope": "fixture"');
      expect(result.stderr).toBe('');
      expect(parsed.type).toBe('nx');
      expect(parsed.project).toEqual(
        expect.objectContaining({ name: 'chat', sourceRoot: 'apps/chat/src' }),
      );
      expect(parsed.stylesheet).toBe('apps/chat/src/styles.css');
      expect(parsed.componentDestination).toBe('apps/chat/src/app/components/ai');
    });
  });

  it('captures stdout, stderr, and exit codes', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      const result = await workspace.run(['--help']);

      result.assertExitCode(0);
      result.assertStdoutIncludes('Usage: duxkit-ui [options] [command]');
      expect(result.stderr).toBe('');
    });
  });

  it('reports file and package changes in the temporary workspace only', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      const before = await workspace.snapshot();
      const packageJson = await workspace.readText('package.json');

      await workspace.writeText('src/styles.css', '@import "tailwindcss";\n');
      await workspace.writeText(
        'package.json',
        packageJson.replace('"@angular/core": "^22.0.0"', '"@angular/core": "^22.1.0"'),
      );

      const after = await workspace.snapshot();
      const changes = diffSnapshots(before, after);

      expect(changes).toContainEqual({ path: 'package.json', type: 'modified' });
      expect(changes).toContainEqual({ path: 'src/styles.css', type: 'modified' });
      expect(await workspace.readText('package.json')).toContain('"@angular/core": "^22.1.0"');
    });
  });

  it('supports read-only dry-run assertions', async () => {
    await withCliFixtureWorkspace('nx-workspace', async (workspace) => {
      const result = await workspace.runDryRun(['add', 'message', '--no-install']);

      result.assertExitCode(1);
      result.assertReadOnly();
      result.assertFileUnchanged('package.json');
      result.assertSourceFixtureUnchanged();
    });
  });

  it('detects installed primitives from duxkit config while listing', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      await workspace.writeText(
        'duxkit-ai.json',
        JSON.stringify(
          {
            primitives: {
              message: {
                version: '0.1.0',
              },
            },
          },
          null,
          2,
        ),
      );

      const result = await workspace.run(['list', '--json']);
      const parsed = JSON.parse(result.stdout) as {
        readonly installed: readonly {
          readonly id: string;
          readonly source: string;
          readonly version?: string;
        }[];
        readonly primitives: readonly { readonly id: string; readonly installed: boolean }[];
      };

      result.assertExitCode(0);
      expect(parsed.installed).toEqual([{ id: 'message', source: 'config', version: '0.1.0' }]);
      expect(parsed.primitives).toContainEqual(
        expect.objectContaining({
          id: 'message',
          installed: true,
        }),
      );
      result.assertSourceFixtureUnchanged();
    });
  });

  it('lists primitives when duxkit config cannot be parsed', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      await workspace.writeText('duxkit-ai.json', '{invalid');

      const result = await workspace.run(['list']);

      result.assertExitCode(0);
      result.assertStdoutIncludes('Available primitives');
      result.assertStdoutIncludes('None detected');
      result.assertSourceFixtureUnchanged();
    });
  });

  it('keeps list installed detection tolerant of unrelated invalid config fields', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      await workspace.writeText(
        'duxkit-ai.json',
        JSON.stringify(
          {
            primitives: {
              message: '0.1.0',
            },
            style: 42,
          },
          null,
          2,
        ),
      );

      const result = await workspace.run(['list', '--json']);
      const parsed = JSON.parse(result.stdout) as {
        readonly installed: readonly {
          readonly id: string;
          readonly source: string;
          readonly version?: string;
        }[];
      };

      result.assertExitCode(0);
      expect(parsed.installed).toEqual([{ id: 'message', source: 'config', version: '0.1.0' }]);
      result.assertSourceFixtureUnchanged();
    });
  });

  it('detects installed primitives from default local files without duxkit config', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      await mkdir(workspace.resolve('src/app/components/ai/message'), { recursive: true });
      await workspace.writeText(
        'src/app/components/ai/message/message.ts',
        'export const marker = true;\n',
      );

      const result = await workspace.run(['list', '--json']);
      const parsed = JSON.parse(result.stdout) as {
        readonly installed: readonly { readonly id: string; readonly source: string }[];
      };

      result.assertExitCode(0);
      expect(parsed.installed).toEqual([{ id: 'message', source: 'files' }]);
      result.assertSourceFixtureUnchanged();
    });
  });

  it('inspects nested cwd, duxkit config, tailwind, tokens, and missing dependencies', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      await workspace.writeText(
        'duxkit-ai.json',
        JSON.stringify(
          {
            componentsPath: 'src/app/components/ai',
            primitives: {
              message: '0.1.0',
            },
            project: 'fixture-app',
            stylesheet: 'src/styles.css',
            style: 'css',
          },
          null,
          2,
        ),
      );
      await workspace.writeText(
        'src/styles.css',
        ['@import "tailwindcss";', ':root {', '  --background: white;', '}'].join('\n'),
      );

      const result = await workspace.run(['inspect', '--cwd', workspace.resolve('src/app'), '--json']);
      const parsed = JSON.parse(result.stdout) as {
        readonly config: { readonly exists: boolean; readonly valid: boolean };
        readonly installedPrimitives: readonly {
          readonly id: string;
          readonly source: string;
          readonly version?: string;
        }[];
        readonly missingDependencies: readonly { readonly name: string }[];
        readonly root: string;
        readonly tailwind: { readonly sourceCoverage: string; readonly v4Imports: boolean };
        readonly tokens: { readonly missing: readonly string[]; readonly present: readonly string[] };
      };

      result.assertExitCode(0);
      expect(parsed.root).toBe(workspace.root);
      expect(parsed.config).toEqual(expect.objectContaining({ exists: true, valid: true }));
      expect(parsed.installedPrimitives).toEqual([
        { id: 'message', source: 'config', version: '0.1.0' },
      ]);
      expect(parsed.tailwind).toEqual(
        expect.objectContaining({ sourceCoverage: 'covered-by-source-root', v4Imports: true }),
      );
      expect(parsed.tokens.present).toContain('--background');
      expect(parsed.tokens.missing).toContain('--foreground');
      expect(parsed.missingDependencies).toContainEqual(expect.objectContaining({ name: 'ai' }));
      result.assertSourceFixtureUnchanged();
    });
  });

  it('detects Nx workspace string project entries', async () => {
    await withCliFixtureWorkspace('nx-workspace', async (workspace) => {
      await mkdir(workspace.resolve('apps/desk/src/app'), { recursive: true });
      await workspace.writeText(
        'workspace.json',
        JSON.stringify(
          {
            projects: {
              desk: 'apps/desk',
            },
          },
          null,
          2,
        ),
      );
      await workspace.writeText(
        'apps/desk/project.json',
        JSON.stringify(
          {
            projectType: 'application',
            root: 'apps/desk',
            sourceRoot: 'apps/desk/src',
            targets: {
              build: {
                options: {
                  styles: ['apps/desk/src/styles.scss'],
                },
              },
            },
          },
          null,
          2,
        ),
      );
      await workspace.writeText('apps/desk/src/styles.scss', '@import "tailwindcss";\n');
      await workspace.writeText(
        'duxkit-ai.json',
        JSON.stringify(
          {
            project: 'desk',
          },
          null,
          2,
        ),
      );

      const result = await workspace.run(['inspect', '--json']);
      const parsed = JSON.parse(result.stdout) as {
        readonly componentDestination: string | null;
        readonly project: { readonly name: string; readonly sourceRoot: string } | null;
        readonly stylesheet: string | null;
        readonly styleLanguage: string;
      };

      result.assertExitCode(0);
      expect(parsed.project).toEqual(
        expect.objectContaining({ name: 'desk', sourceRoot: 'apps/desk/src' }),
      );
      expect(parsed.stylesheet).toBe('apps/desk/src/styles.scss');
      expect(parsed.styleLanguage).toBe('scss');
      expect(parsed.componentDestination).toBe('apps/desk/src/app/components/ai');
      result.assertSourceFixtureUnchanged();
    });
  });

  it('reports invalid duxkit config during inspect', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      await workspace.writeText(
        'duxkit-ai.json',
        JSON.stringify({ primitives: { unknown: '0.1.0' } }, null, 2),
      );

      const result = await workspace.run(['inspect', '--json']);
      const parsed = JSON.parse(result.stdout) as {
        readonly config: {
          readonly errors: readonly string[];
          readonly exists: boolean;
          readonly valid: boolean;
        };
        readonly installedPrimitives: readonly unknown[];
      };

      result.assertExitCode(0);
      expect(parsed.config.exists).toBe(true);
      expect(parsed.config.valid).toBe(false);
      expect(parsed.config.errors).toContain(
        'duxkit-ai.json primitives has unknown primitive id: unknown.',
      );
      expect(parsed.installedPrimitives).toEqual([]);
      result.assertSourceFixtureUnchanged();
    });
  });
});
