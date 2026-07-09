import { mkdir, stat } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { diffSnapshots, withCliFixtureWorkspace } from './cli-fixture-harness.js';

describe('CLI fixture harness', () => {
  it.each(['angular-cli-app', 'nx-workspace'] as const)(
    'plans a complete read-only init for the %s fixture',
    async (fixtureName) => {
      await withCliFixtureWorkspace(fixtureName, async (workspace) => {
        const result = await workspace.run([
          'init',
          '--dry-run',
          '--json',
          '--package-manager',
          'npm',
          '--tokens',
          'add',
        ]);
        const parsed = JSON.parse(result.stdout) as {
          readonly packageManager: string;
          readonly plannedChanges: readonly { readonly category: string }[];
          readonly status: string;
          readonly packages: { readonly missing: readonly { readonly name: string }[] };
          readonly postcss: { readonly action: string } | null;
          readonly tailwind: { readonly action: string } | null;
          readonly tokens: { readonly action: string } | null;
        };

        result.assertExitCode(0);
        expect(result.stderr).toBe('');
        expect(parsed.status).toBe('ready');
        expect(parsed.packageManager).toBe('npm');
        expect(parsed.plannedChanges.map((change) => change.category)).toEqual(
          expect.arrayContaining([
            'config',
            'directory',
            'package',
            'postcss',
            'tailwind',
            'tokens',
          ]),
        );
        expect(parsed.packages.missing).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ name: '@spartan-ng/brain' }),
            expect.objectContaining({ name: 'tw-animate-css' }),
            expect.objectContaining({ name: 'tailwindcss' }),
            expect.objectContaining({ name: '@tailwindcss/postcss' }),
          ]),
        );
        expect(parsed.postcss?.action).toBe('create');
        expect(parsed.tailwind?.action).toBe('add');
        expect(parsed.tokens?.action).toBe('add');
        result.assertReadOnly();
        result.assertSourceFixtureUnchanged();
      });
    },
  );

  it('keeps blocked init JSON machine-readable and names missing flags', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      const result = await workspace.run(['init', '--dry-run', '--json']);
      const parsed = JSON.parse(result.stdout) as {
        readonly ambiguities: readonly { readonly flag: string }[];
        readonly status: string;
      };

      result.assertExitCode(1);
      expect(result.stderr).toBe('');
      expect(parsed.status).toBe('blocked');
      expect(parsed.ambiguities).toContainEqual(
        expect.objectContaining({ flag: '--tokens add|skip' }),
      );
      expect(parsed.ambiguities).toContainEqual(
        expect.objectContaining({ flag: '--package-manager <npm|pnpm|yarn|bun>' }),
      );
      result.assertReadOnly();
      result.assertSourceFixtureUnchanged();
    });
  });

  it('blocks require-existing modes and plans missing partial Tailwind v4 setup', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      await workspace.writeText('src/styles.css', '@import "tailwindcss";\n');

      const result = await workspace.run([
        'init',
        '--dry-run',
        '--json',
        '--package-manager',
        'npm',
        '--tailwind',
        'add',
        '--postcss',
        'require-existing',
        '--tokens',
        'require-existing',
      ]);
      const parsed = JSON.parse(result.stdout) as {
        readonly ambiguities: readonly { readonly flag: string }[];
        readonly status: string;
        readonly tailwind: { readonly imports: readonly string[] } | null;
      };

      result.assertExitCode(1);
      expect(result.stderr).toBe('');
      expect(parsed.status).toBe('blocked');
      expect(parsed.ambiguities).toContainEqual(expect.objectContaining({ flag: '--postcss add' }));
      expect(parsed.ambiguities).toContainEqual(expect.objectContaining({ flag: '--tokens add' }));
      expect(parsed.tailwind?.imports).toEqual(
        expect.arrayContaining(['@layer theme, base, components, utilities;']),
      );
      result.assertReadOnly();
      result.assertSourceFixtureUnchanged();
    });
  });

  it.each([
    ['angular-cli-app', 'src/app/components/ai', 'src/styles.css'],
    ['nx-workspace', 'apps/chat/src/app/components/ai', 'apps/chat/src/styles.css'],
  ] as const)(
    'applies safe init mutations to the %s fixture without installation',
    async (fixtureName, componentsPath, stylesheetPath) => {
      await withCliFixtureWorkspace(fixtureName, async (workspace) => {
        const result = await workspace.run([
          'init',
          '--yes',
          '--no-install',
          '--package-manager',
          'npm',
          '--tokens',
          'add',
        ]);

        result.assertExitCode(0);
        expect(result.stderr).toBe('');
        expect(result.packageChanges).toEqual([]);
        result.assertFileChanged('duxkit-ai.json');
        result.assertFileChanged('.postcssrc.json');
        result.assertFileChanged(stylesheetPath);
        expect(JSON.parse(await workspace.readText('duxkit-ai.json'))).toEqual(
          expect.objectContaining({ componentsPath, stylesheet: stylesheetPath }),
        );
        expect(await workspace.readText('.postcssrc.json')).toContain('@tailwindcss/postcss');
        expect(await workspace.readText(stylesheetPath)).toContain(
          "@import 'tailwindcss/theme.css' layer(theme);",
        );
        expect(await workspace.readText(stylesheetPath)).toContain('--background:');
        expect((await stat(workspace.resolve(componentsPath))).isDirectory()).toBe(true);
        result.assertSourceFixtureUnchanged();
      });
    },
  );

  it('requires --yes for non-interactive init writes', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      const result = await workspace.run(['init', '--package-manager', 'npm', '--tokens', 'add']);

      result.assertExitCode(1);
      result.assertStderrIncludes('pass --yes');
      result.assertReadOnly();
      result.assertSourceFixtureUnchanged();
    });
  });

  it('keeps applied init JSON free of human-readable output', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      const result = await workspace.run([
        'init',
        '--yes',
        '--no-install',
        '--package-manager',
        'npm',
        '--tokens',
        'add',
        '--json',
      ]);
      const parsed = JSON.parse(result.stdout) as {
        readonly applied: boolean;
        readonly status: string;
      };

      result.assertExitCode(0);
      expect(result.stderr).toBe('');
      expect(parsed).toEqual(expect.objectContaining({ applied: true, status: 'applied' }));
      result.assertSourceFixtureUnchanged();
    });
  });

  it('preserves existing token values and JSON PostCSS plugins while adding missing setup', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      await workspace.writeText('src/styles.css', ':root {\n  --background: rgb(1 2 3);\n}\n');
      await workspace.writeText(
        '.postcssrc.json',
        JSON.stringify({ plugins: { 'existing-plugin': {} }, syntax: 'preserve-me' }, null, 2),
      );

      const result = await workspace.run([
        'init',
        '--yes',
        '--no-install',
        '--package-manager',
        'npm',
        '--tokens',
        'add',
      ]);

      result.assertExitCode(0);
      const stylesheet = await workspace.readText('src/styles.css');
      const postcss = JSON.parse(await workspace.readText('.postcssrc.json')) as {
        readonly plugins: Readonly<Record<string, unknown>>;
        readonly syntax: string;
      };

      expect(stylesheet.match(/--background:/g)).toHaveLength(1);
      expect(stylesheet).toContain('--background: rgb(1 2 3);');
      expect(postcss.plugins).toEqual(
        expect.objectContaining({ 'existing-plugin': {}, '@tailwindcss/postcss': {} }),
      );
      expect(postcss.syntax).toBe('preserve-me');
      result.assertSourceFixtureUnchanged();
    });
  });

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
      expect(parsed.project).toEqual(
        expect.objectContaining({ name: 'fixture-app', sourceRoot: 'src' }),
      );
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

      result.assertExitCode(0);
      result.assertReadOnly();
      result.assertFileUnchanged('package.json');
      result.assertStdoutIncludes('Requested primitives');
      result.assertSourceFixtureUnchanged();
    });
  });

  it('plans requested primitives, transitive dependencies, packages, and templates deterministically', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      const argv = [
        'add',
        'Message',
        '--dry-run',
        '--json',
        '--package-manager',
        'npm',
        '--no-install',
      ] as const;
      const first = await workspace.run(argv);
      const second = await workspace.run(argv);
      const parsed = JSON.parse(first.stdout) as {
        readonly componentDestination: string;
        readonly config: { readonly action: string };
        readonly files: readonly { readonly status: string }[];
        readonly included: readonly string[];
        readonly packages: {
          readonly installCommands: readonly string[];
          readonly missing: readonly { readonly name: string }[];
        };
        readonly requested: readonly string[];
        readonly status: string;
        readonly stylesheetChanges: readonly { readonly file: string }[];
      };

      first.assertExitCode(0);
      second.assertExitCode(0);
      expect(first.stderr).toBe('');
      expect(second.stderr).toBe('');
      expect(first.stdout).toBe(second.stdout);
      expect(parsed.status).toBe('ready');
      expect(parsed.requested).toEqual(['message']);
      expect(parsed.included).toEqual(['markdown', 'code-block']);
      expect(parsed.componentDestination).toBe('src/app/components/ai');
      expect(parsed.config.action).toBe('create');
      expect(parsed.files).toHaveLength(13);
      expect(parsed.files.every((file) => file.status === 'create')).toBe(true);
      expect(parsed.stylesheetChanges).toEqual([
        expect.objectContaining({ file: 'markdown.scss' }),
      ]);
      expect(parsed.packages.missing).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'ai' }),
          expect.objectContaining({ name: 'marked' }),
          expect.objectContaining({ name: 'highlight.js' }),
        ]),
      );
      expect(parsed.packages.missing).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'tailwindcss' }),
          expect.objectContaining({ name: 'tw-animate-css' }),
        ]),
      );
      expect(parsed.packages.installCommands.length).toBeGreaterThan(0);
      first.assertReadOnly();
      first.assertSourceFixtureUnchanged();
    });
  });

  it('uses the configured Nx component destination and resolves aliases', async () => {
    await withCliFixtureWorkspace('nx-workspace', async (workspace) => {
      const result = await workspace.run(['add', 'prompt', '--dry-run', '--json', '--no-install']);
      const parsed = JSON.parse(result.stdout) as {
        readonly componentDestination: string;
        readonly requested: readonly string[];
        readonly status: string;
      };

      result.assertExitCode(0);
      expect(parsed).toEqual(
        expect.objectContaining({
          componentDestination: 'apps/chat/src/app/components/ai',
          requested: ['prompt-input'],
          status: 'ready',
        }),
      );
      result.assertReadOnly();
      result.assertSourceFixtureUnchanged();
    });
  });

  it('plans a deduplicated global @source change when the destination is outside the app source root', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      const result = await workspace.run([
        'add',
        'message',
        '--components-path',
        'generated/ai',
        '--package-manager',
        'npm',
        '--dry-run',
        '--json',
        '--no-install',
      ]);
      const parsed = JSON.parse(result.stdout) as {
        readonly plannedChanges: readonly {
          readonly category: string;
          readonly detail: string;
        }[];
        readonly stylesheetPlan: {
          readonly action: string;
          readonly path: string | null;
          readonly sourcePath: string | null;
        };
      };

      result.assertExitCode(0);
      expect(parsed.stylesheetPlan).toEqual({
        action: 'add',
        path: 'src/styles.css',
        sourcePath: '../generated/ai',
      });
      expect(parsed.plannedChanges).toContainEqual(
        expect.objectContaining({
          category: 'stylesheet',
          detail: "Add @source '../generated/ai' to src/styles.css.",
        }),
      );
      result.assertReadOnly();
      result.assertSourceFixtureUnchanged();
    });
  });

  it('reports nearest primitive suggestions in human and JSON-safe blocked plans', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      const result = await workspace.run(['add', 'mesage', '--dry-run', '--json', '--no-install']);
      const parsed = JSON.parse(result.stdout) as {
        readonly errors: readonly string[];
        readonly status: string;
      };

      result.assertExitCode(1);
      expect(result.stderr).toBe('');
      expect(parsed.status).toBe('blocked');
      expect(parsed.errors.join(' ')).toContain('Did you mean "message"?');
      expect(parsed.errors.join(' ')).toContain('duxkit-ui list');
      result.assertReadOnly();
      result.assertSourceFixtureUnchanged();
    });
  });

  it('classifies customized, foreign, and blocked targets before any write', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      await mkdir(workspace.resolve('src/app/components/ai/message'), { recursive: true });
      await mkdir(workspace.resolve('src/app/components/ai/markdown'), { recursive: true });
      await workspace.writeText(
        'duxkit-ai.json',
        JSON.stringify(
          {
            componentsPath: 'src/app/components/ai',
            primitives: { message: '0.1.0' },
          },
          null,
          2,
        ),
      );
      await workspace.writeText(
        'src/app/components/ai/message/message.ts',
        'export const customized = true;\n',
      );
      await workspace.writeText(
        'src/app/components/ai/markdown/markdown.ts',
        'export const foreign = true;\n',
      );

      const result = await workspace.run(['add', 'message', '--dry-run', '--json', '--no-install']);
      const parsed = JSON.parse(result.stdout) as {
        readonly conflicts: readonly { readonly primitive: string; readonly status: string }[];
        readonly files: readonly {
          readonly file: string;
          readonly primitive: string;
          readonly status: string;
        }[];
        readonly status: string;
      };

      result.assertExitCode(1);
      expect(parsed.status).toBe('blocked');
      expect(parsed.conflicts).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            file: 'message.ts',
            primitive: 'message',
            status: 'customized',
          }),
          expect.objectContaining({
            file: 'markdown.ts',
            primitive: 'markdown',
            status: 'foreign',
          }),
        ]),
      );
      expect(parsed.files).toEqual(
        expect.arrayContaining([expect.objectContaining({ file: 'index.ts', status: 'create' })]),
      );
      result.assertReadOnly();
      result.assertSourceFixtureUnchanged();
    });
  });

  it('blocks unsafe component destinations during preflight', async () => {
    await withCliFixtureWorkspace('nx-workspace', async (workspace) => {
      const result = await workspace.run([
        'add',
        'message',
        '--components-path',
        '../outside',
        '--dry-run',
        '--json',
        '--no-install',
      ]);
      const parsed = JSON.parse(result.stdout) as {
        readonly files: readonly { readonly status: string }[];
        readonly status: string;
      };

      result.assertExitCode(1);
      expect(parsed.status).toBe('blocked');
      expect(parsed.files.some((file) => file.status === 'blocked')).toBe(true);
      result.assertReadOnly();
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

      const result = await workspace.run([
        'inspect',
        '--cwd',
        workspace.resolve('src/app'),
        '--json',
      ]);
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
        readonly tokens: {
          readonly missing: readonly string[];
          readonly present: readonly string[];
        };
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
