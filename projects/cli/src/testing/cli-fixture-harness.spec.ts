import { execFile } from 'node:child_process';
import { mkdir, realpath, stat, symlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';
import { AddApplyError, applyAddPlan } from '../lib/add-apply.js';
import { createAddPlan, isWritableAddFile } from '../lib/add-plan.js';
import { diffSnapshots, withCliFixtureWorkspace } from './cli-fixture-harness.js';

const execFileAsync = promisify(execFile);
const remainingV1PrimitiveIds = [
  'attachment',
  'chain-of-thought',
  'checkpoint',
  'confirmation',
  'context',
  'model-selector',
  'queue',
  'shimmer',
  'sources',
  'task',
] as const;

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
    ['angular-cli-app', 'libs/dux-ui', 'src/styles.css'],
    ['nx-workspace', 'libs/dux-ui', 'apps/chat/src/styles.css'],
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

  it('uses the library path chosen during interactive init', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      const result = await workspace.run(
        ['init', '--no-install', '--package-manager', 'npm', '--tokens', 'add'],
        {},
        {
          confirmations: [true],
          libraryPaths: ['libs/custom-ui'],
        },
      );

      result.assertExitCode(0);
      result.assertStderrIncludes('Library path (libs/dux-ui): libs/custom-ui');
      expect((await stat(workspace.resolve('libs/custom-ui'))).isDirectory()).toBe(true);
      expect(JSON.parse(await workspace.readText('duxkit-ai.json'))).toEqual(
        expect.objectContaining({ componentsPath: 'libs/custom-ui' }),
      );
    });
  });

  it('uses the default library path when the init prompt is left empty', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      const result = await workspace.run(
        ['init', '--no-install', '--package-manager', 'npm', '--tokens', 'add'],
        {},
        {
          confirmations: [true],
          libraryPaths: [''],
        },
      );

      result.assertExitCode(0);
      result.assertStderrIncludes('Library path (libs/dux-ui):');
      expect(JSON.parse(await workspace.readText('duxkit-ai.json'))).toEqual(
        expect.objectContaining({ componentsPath: 'libs/dux-ui' }),
      );
      expect((await stat(workspace.resolve('libs/dux-ui'))).isDirectory()).toBe(true);
    });
  });

  it('lets add redirect an initialized workspace to another library path', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      const initialized = await workspace.run([
        'init',
        '--yes',
        '--no-install',
        '--package-manager',
        'npm',
        '--tokens',
        'add',
      ]);
      initialized.assertExitCode(0);

      const result = await workspace.run([
        'add',
        'message',
        '--library-path',
        'libs/custom-ui',
        '--yes',
        '--no-install',
        '--package-manager',
        'npm',
      ]);

      result.assertExitCode(0);
      result.assertFileChanged('libs/custom-ui/message/message.ts');
      expect(JSON.parse(await workspace.readText('duxkit-ai.json'))).toEqual(
        expect.objectContaining({
          componentsPath: 'libs/custom-ui',
          tailwind: expect.objectContaining({ sourcePath: './libs/custom-ui' }),
        }),
      );
    });
  });

  it('prints a concise init summary by default', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      const result = await workspace.run([
        'init',
        '--dry-run',
        '--no-install',
        '--package-manager',
        'npm',
        '--tokens',
        'add',
      ]);

      result.assertExitCode(0);
      result.assertReadOnly();
      result.assertStdoutIncludes('Ready to initialize Duxkit AI');
      result.assertStdoutIncludes('9 changes planned');
      result.assertStdoutIncludes('npm install @spartan-ng/brain@^1.0.2 tw-animate-css@^1.4.0');
      expect(result.stdout).not.toContain('Planned changes');
      expect(result.stdout).not.toContain('once init mutations are available');
    });
  });

  it('prints the complete init plan once with --verbose', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      const result = await workspace.run([
        'init',
        '--dry-run',
        '--no-install',
        '--package-manager',
        'npm',
        '--tokens',
        'add',
        '--verbose',
      ]);
      const installCommand = 'npm install @spartan-ng/brain@^1.0.2 tw-animate-css@^1.4.0';

      result.assertExitCode(0);
      result.assertReadOnly();
      result.assertStdoutIncludes('Init plan (ready)');
      result.assertStdoutIncludes('Planned changes');
      expect(result.stdout.split(installCommand)).toHaveLength(2);
      expect(result.stdout).not.toContain('once init mutations are available');
    });
  });

  it('requires --yes for non-interactive init writes', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      const result = await workspace.run(['init', '--package-manager', 'npm', '--tokens', 'add']);

      result.assertExitCode(1);
      result.assertStderrIncludes('pass --yes');
      result.assertReadOnly();
      result.assertSourceFixtureUnchanged();
    });
  });

  it('prints the init summary and asks one final confirmation in interactive mode', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      const result = await workspace.run(
        ['init', '--no-install', '--package-manager', 'npm', '--tokens', 'add'],
        {},
        { confirmations: [false] },
      );

      result.assertExitCode(1);
      result.assertStdoutIncludes('Ready to initialize Duxkit AI');
      result.assertStdoutIncludes('9 changes planned');
      result.assertStderrIncludes('Apply these changes? (y/N) n');
      result.assertStderrIncludes('Initialization cancelled.');
      result.assertReadOnly();
    });
  });

  it('does not ask for interactive confirmation when init receives --yes', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      const result = await workspace.run(
        ['init', '--yes', '--no-install', '--package-manager', 'npm', '--tokens', 'add'],
        {},
        { confirmations: [] },
      );

      result.assertExitCode(0);
      expect(result.stderr).toBe('');
      result.assertFileChanged('duxkit-ai.json');
    });
  });

  it('--yes accepts safe defaults but does not resolve conflicting config ambiguity', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      await workspace.writeText(
        'duxkit-ai.json',
        JSON.stringify(
          {
            componentsPath: 'src/app/components/ai',
            project: 'fixture-app',
            stylesheet: 'src/styles.css',
            style: 'css',
          },
          null,
          2,
        ),
      );
      const result = await workspace.run([
        'init',
        '--yes',
        '--no-install',
        '--package-manager',
        'npm',
        '--library-path',
        'src/app/components/other',
        '--json',
      ]);
      const parsed = JSON.parse(result.stdout) as {
        readonly ambiguities: readonly { readonly flag: string }[];
        readonly status: string;
      };

      result.assertExitCode(1);
      expect(result.stderr).toBe('');
      expect(parsed.status).toBe('blocked');
      expect(parsed.ambiguities).toContainEqual(
        expect.objectContaining({ flag: '--library-path (or --force)' }),
      );
      result.assertReadOnly();
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

  it('prints an interactive JSON init plan to stderr while keeping stdout parseable', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      const result = await workspace.run(
        ['init', '--json', '--no-install', '--package-manager', 'npm', '--tokens', 'add'],
        {},
        { confirmations: [true] },
      );
      const parsed = JSON.parse(result.stdout) as { readonly status: string };

      result.assertExitCode(0);
      expect(parsed.status).toBe('applied');
      result.assertStderrIncludes('"plannedChanges"');
      result.assertStderrIncludes('Apply these changes? (y/N) y');
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
      expect(parsed.componentDestination).toBe('libs/dux-ui');
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
      expect(parsed.componentDestination).toBe('libs/dux-ui');
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

  it('prints a concise add summary by default', async () => {
    await withCliFixtureWorkspace('nx-workspace', async (workspace) => {
      const result = await workspace.runDryRun(['add', 'message', '--no-install']);

      result.assertExitCode(0);
      result.assertReadOnly();
      result.assertFileUnchanged('package.json');
      result.assertStdoutIncludes('Ready to add message');
      result.assertStdoutIncludes('13 files to create');
      expect(result.stdout).not.toContain('Generated files');
      expect(result.stdout).not.toContain('message/message-content.ts');
      result.assertSourceFixtureUnchanged();
    });
  });

  it('prints the complete add plan with --verbose', async () => {
    await withCliFixtureWorkspace('nx-workspace', async (workspace) => {
      const result = await workspace.runDryRun(['add', 'message', '--no-install', '--verbose']);

      result.assertExitCode(0);
      result.assertReadOnly();
      result.assertStdoutIncludes('Requested primitives');
      result.assertStdoutIncludes('Generated files');
      result.assertStdoutIncludes('message/message-content.ts');
    });
  });

  it('applies primitive templates, config, and ownership guidance without installation', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      const result = await workspace.run([
        'add',
        'message',
        '--yes',
        '--no-install',
        '--package-manager',
        'npm',
      ]);

      result.assertExitCode(0);
      expect(result.stderr).toBe('');
      expect(result.packageChanges).toEqual([]);
      result.assertFileChanged('libs/dux-ui/message/message.ts');
      result.assertFileChanged('libs/dux-ui/markdown/markdown.scss');
      result.assertFileChanged('duxkit-ai.json');
      expect(JSON.parse(await workspace.readText('duxkit-ai.json'))).toEqual(
        expect.objectContaining({
          primitives: {
            'code-block': '0.1.0',
            markdown: '0.1.0',
            message: '0.1.0',
          },
        }),
      );
      expect(result.stdout).toContain('Import examples');
      expect(result.stdout).toContain('../../libs/dux-ui/message');
      expect(result.stdout).toContain(
        'Generated files are now part of your app and can be edited.',
      );
      result.assertSourceFixtureUnchanged();
    });
  });

  it('lets interactive users choose components when add receives no names', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      const result = await workspace.run(
        ['add', '--yes', '--no-install', '--package-manager', 'npm'],
        {},
        {
          confirmations: [],
          primitiveSelections: [['conversation', 'message']],
        },
      );

      result.assertExitCode(0);
      result.assertStderrIncludes('Select components to add: conversation, message');
      result.assertStdoutIncludes('Ready to add conversation, message');
      result.assertFileChanged('libs/dux-ui/conversation/index.ts');
      result.assertFileChanged('libs/dux-ui/message/index.ts');
    });
  });

  it('exits cleanly when interactive component selection is cancelled', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      const result = await workspace.run(
        ['add', '--no-install', '--package-manager', 'npm'],
        {},
        {
          confirmations: [],
          primitiveSelections: [null],
        },
      );

      result.assertExitCode(1);
      result.assertStderrIncludes('Component selection cancelled.');
      result.assertReadOnly();
    });
  });

  it.each(remainingV1PrimitiveIds)('plans the remaining V1 %s primitive', async (primitive) => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      const result = await workspace.run([
        'add',
        primitive,
        '--dry-run',
        '--json',
        '--no-install',
        '--package-manager',
        'npm',
      ]);
      const parsed = JSON.parse(result.stdout) as {
        readonly files: readonly { readonly primitive: string; readonly status: string }[];
        readonly requested: readonly string[];
        readonly status: string;
      };

      result.assertExitCode(0);
      expect(parsed.status).toBe('ready');
      expect(parsed.requested).toEqual([primitive]);
      expect(parsed.files).toContainEqual(expect.objectContaining({ primitive, status: 'create' }));
      result.assertReadOnly();
    });
  });

  it('adds and type-checks the complete V1 primitive catalog', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      const result = await workspace.run([
        'add',
        '--all',
        '--yes',
        '--no-install',
        '--package-manager',
        'npm',
      ]);

      result.assertExitCode(0);
      result.assertStdoutIncludes('and 15 more');
      expect(result.stdout).not.toContain('AttachmentPrimitive');
      for (const primitive of remainingV1PrimitiveIds) {
        result.assertFileChanged(`libs/dux-ui/${primitive}/index.ts`);
      }

      await symlink(resolve('node_modules'), workspace.resolve('node_modules'), 'dir');
      try {
        await execFileAsync(
          resolve('node_modules/.bin/ngc'),
          ['-p', 'tsconfig.json', '--noEmit', '--skipLibCheck'],
          {
            cwd: workspace.root,
            encoding: 'utf8',
            maxBuffer: 1024 * 1024,
          },
        );
      } catch (error) {
        const output =
          error instanceof Error && 'stdout' in error
            ? `${String(error.stdout)}${String(error.stderr)}`
            : String(error);
        throw new Error(`Generated V1 catalog did not type-check:\n${output}`, { cause: error });
      }
      result.assertSourceFixtureUnchanged();
    });
  }, 30_000);

  it('requires --yes for non-interactive add writes', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      const result = await workspace.run([
        'add',
        'message',
        '--no-install',
        '--package-manager',
        'npm',
      ]);

      result.assertExitCode(1);
      result.assertStderrIncludes('Pass --yes');
      result.assertReadOnly();
    });
  });

  it('prints the add summary and asks one final confirmation in interactive mode', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      const result = await workspace.run(
        ['add', 'message', '--no-install', '--package-manager', 'npm'],
        {},
        { confirmations: [true] },
      );

      result.assertExitCode(0);
      result.assertStdoutIncludes('Ready to add message');
      result.assertStdoutIncludes('13 files to create');
      result.assertStderrIncludes('Apply these changes? (y/N) y');
      result.assertFileChanged('libs/dux-ui/message/message.ts');
    });
  });

  it('--no-install prints exact commands without invoking the package manager', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      const planned = await workspace.run([
        'add',
        'message',
        '--dry-run',
        '--json',
        '--no-install',
        '--package-manager',
        'npm',
      ]);
      const plan = JSON.parse(planned.stdout) as {
        readonly packages: { readonly installCommands: readonly string[] };
      };
      await workspace.writeExecutable(
        '.test-bin/npm',
        '#!/bin/sh\ntouch "$DUXKIT_MARKER"\nexit 91\n',
      );
      const result = await workspace.run(
        ['add', 'message', '--yes', '--no-install', '--package-manager', 'npm'],
        {
          DUXKIT_MARKER: workspace.resolve('.test-bin/package-manager-invoked'),
          PATH: `${workspace.resolve('.test-bin')}:${process.env.PATH ?? ''}`,
        },
      );

      result.assertExitCode(0);
      expect(plan.packages.installCommands.length).toBeGreaterThan(0);
      for (const command of plan.packages.installCommands) {
        result.assertStdoutIncludes(command);
      }
      expect(result.after.file('.test-bin/package-manager-invoked')).toBeUndefined();
      expect(result.packageChanges).toEqual([]);
    });
  });

  it('writes a planned global @source after generated files', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      const result = await workspace.run([
        'add',
        'message',
        '--library-path',
        'generated/ai',
        '--yes',
        '--no-install',
        '--package-manager',
        'npm',
      ]);

      result.assertExitCode(0);
      result.assertFileChanged('src/styles.css');
      expect(await workspace.readText('src/styles.css')).toContain("@source '../generated/ai';");
      result.assertSourceFixtureUnchanged();
    });
  });

  it('installs dependencies before writing generated files', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      await workspace.writeExecutable(
        '.test-bin/npm',
        [
          '#!/bin/sh',
          'if [ -e "$DUXKIT_ROOT/libs/dux-ui" ]; then exit 17; fi',
          'printf "%s\\n" "$@" > "$DUXKIT_LOG"',
          'touch "$DUXKIT_MARKER"',
        ].join('\n') + '\n',
      );
      const path = `${workspace.resolve('.test-bin')}:${process.env.PATH ?? ''}`;
      const result = await workspace.run(['add', 'message', '--yes', '--package-manager', 'npm'], {
        DUXKIT_LOG: workspace.resolve('.test-bin/install.log'),
        DUXKIT_MARKER: workspace.resolve('.test-bin/install-complete'),
        DUXKIT_ROOT: workspace.root,
        PATH: path,
      });

      result.assertExitCode(0);
      expect(await workspace.readText('.test-bin/install-complete')).toBe('');
      expect(await workspace.readText('.test-bin/install.log')).toContain('install');
      expect(await workspace.readText('.test-bin/install.log')).toContain('ai@^6.0.207');
      result.assertFileChanged('libs/dux-ui/message/message.ts');
      result.assertSourceFixtureUnchanged();
    });
  });

  it('leaves generated source, config, and stylesheet unchanged when installation fails', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      await workspace.writeExecutable('.test-bin/npm', '#!/bin/sh\nexit 23\n');
      const before = await workspace.snapshot();
      const result = await workspace.run(['add', 'message', '--yes', '--package-manager', 'npm'], {
        DUXKIT_ROOT: workspace.root,
        PATH: `${workspace.resolve('.test-bin')}:${process.env.PATH ?? ''}`,
      });

      result.assertExitCode(1);
      result.assertStderrIncludes('Add failed.');
      expect(result.fileChanges).toEqual([]);
      expect(result.packageChanges).toEqual([]);
      expect((await workspace.snapshot()).files).toEqual(before.files);
      result.assertSourceFixtureUnchanged();
    });
  });

  it('leaves init source, config, and stylesheet unchanged when installation fails', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      await workspace.writeExecutable('.test-bin/npm', '#!/bin/sh\nexit 23\n');
      const before = await workspace.snapshot();
      const result = await workspace.run(
        ['init', '--yes', '--package-manager', 'npm', '--tokens', 'add'],
        { PATH: `${workspace.resolve('.test-bin')}:${process.env.PATH ?? ''}` },
      );

      result.assertExitCode(1);
      result.assertStderrIncludes('Init failed.');
      expect(result.fileChanges).toEqual([]);
      expect((await workspace.snapshot()).files).toEqual(before.files);
    });
  });

  it('reports completed and pending steps when a later init write fails', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      await workspace.writeExecutable(
        '.test-bin/npm',
        '#!/bin/sh\nmkdir -p "$DUXKIT_ROOT/.postcssrc.json"\n',
      );
      const result = await workspace.run(
        ['init', '--yes', '--package-manager', 'npm', '--tokens', 'add'],
        {
          DUXKIT_ROOT: workspace.root,
          PATH: `${workspace.resolve('.test-bin')}:${process.env.PATH ?? ''}`,
        },
      );

      result.assertExitCode(1);
      result.assertStderrIncludes('Partial changes were made.');
      result.assertStderrIncludes('dependencies installed');
      result.assertStderrIncludes('duxkit-ai.json written');
      result.assertStderrIncludes('PostCSS config written');
      result.assertStderrIncludes('stylesheet written');
      result.assertFileChanged('duxkit-ai.json');
      result.assertFileUnchanged('src/styles.css');
    });
  });

  it('reports completed and pending steps when a later generated write fails', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      await workspace.writeExecutable(
        '.test-bin/npm',
        [
          '#!/bin/sh',
          'mkdir -p "$DUXKIT_ROOT/libs/dux-ui/message/message-action-classes.ts"',
        ].join('\n') + '\n',
      );
      const result = await workspace.run(['add', 'message', '--yes', '--package-manager', 'npm'], {
        DUXKIT_ROOT: workspace.root,
        PATH: `${workspace.resolve('.test-bin')}:${process.env.PATH ?? ''}`,
      });

      result.assertExitCode(1);
      result.assertStderrIncludes('Partial changes were made.');
      result.assertStderrIncludes('primitive markdown files written');
      result.assertStderrIncludes('primitive message files written');
      result.assertFileChanged('libs/dux-ui/markdown/markdown.ts');
      result.assertFileUnchanged('duxkit-ai.json');
      expect(
        (
          await stat(workspace.resolve('libs/dux-ui/message/message-action-classes.ts'))
        ).isDirectory(),
      ).toBe(true);
      result.assertSourceFixtureUnchanged();
    });
  });

  it('keeps partial add failure stdout as one JSON document', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      await workspace.writeExecutable(
        '.test-bin/npm',
        '#!/bin/sh\nmkdir -p "$DUXKIT_ROOT/libs/dux-ui/message/message-action-classes.ts"\n',
      );
      const result = await workspace.run(
        ['add', 'message', '--yes', '--json', '--package-manager', 'npm'],
        {
          DUXKIT_ROOT: workspace.root,
          PATH: `${workspace.resolve('.test-bin')}:${process.env.PATH ?? ''}`,
        },
      );
      const parsed = JSON.parse(result.stdout) as {
        readonly completedSteps: readonly string[];
        readonly message: string;
        readonly pendingSteps: readonly string[];
        readonly partialChanges: boolean;
        readonly status: string;
      };

      result.assertExitCode(1);
      expect(result.stderr).toBe('');
      expect(parsed.status).toBe('failed');
      expect(parsed.message).toBe('Partial changes were made');
      expect(parsed.partialChanges).toBe(true);
      expect(parsed.completedSteps.length).toBeGreaterThan(0);
      expect(parsed.pendingSteps.length).toBeGreaterThan(0);
    });
  });

  it('tracks partial changes at generated-file granularity', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      const plan = await createAddPlan(
        ['message'],
        { noInstall: true, packageManager: 'npm', yes: true },
        await realpath(workspace.root),
      );
      const writableFiles = plan.files.filter((file) => isWritableAddFile(plan.force, file));
      const failingFile = writableFiles[1];

      expect(failingFile, JSON.stringify(plan.errors)).toBeDefined();
      await mkdir(workspace.resolve(failingFile?.path ?? ''), { recursive: true });

      let failure: unknown;
      try {
        await applyAddPlan(plan, { noInstall: true });
      } catch (error) {
        failure = error;
      }

      expect(failure).toBeInstanceOf(AddApplyError);
      if (!(failure instanceof AddApplyError)) return;
      expect(failure.partialChanges).toBe(true);
      expect(failure.completedSteps).toContain('dependencies skipped (--no-install)');
      expect(failure.completedSteps).toContain(
        `primitive ${writableFiles[0]?.primitive} file ${writableFiles[0]?.file} written`,
      );
      expect(failure.pendingSteps).toContain(
        `primitive ${failingFile?.primitive} file ${failingFile?.file} written`,
      );
    });
  });

  it('does not report partial changes for a skipped install followed by the first write failing', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      const plan = await createAddPlan(
        ['message'],
        { noInstall: true, packageManager: 'npm', yes: true },
        await realpath(workspace.root),
      );
      const firstFile = plan.files.find((file) => isWritableAddFile(plan.force, file));

      expect(firstFile, JSON.stringify(plan.errors)).toBeDefined();
      await mkdir(workspace.resolve(firstFile?.path ?? ''), { recursive: true });

      let failure: unknown;
      try {
        await applyAddPlan(plan, { noInstall: true });
      } catch (error) {
        failure = error;
      }

      expect(failure).toBeInstanceOf(AddApplyError);
      if (!(failure instanceof AddApplyError)) return;
      expect(failure.partialChanges).toBe(false);
      expect(failure.completedSteps).toEqual(['dependencies skipped (--no-install)']);
    });
  });

  it('--force overwrites only configured Duxkit-owned generated files', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      const initial = await workspace.run([
        'add',
        'message',
        '--yes',
        '--no-install',
        '--package-manager',
        'npm',
      ]);
      initial.assertExitCode(0);
      const generated = initial.after.file('libs/dux-ui/message/message.ts');
      await workspace.writeText(
        'libs/dux-ui/message/message.ts',
        'export const customized = true;\n',
      );
      await workspace.writeText('src/app/app.config.ts', 'export const appConfig = "foreign";\n');
      await workspace.writeText('src/app/app.routes.ts', 'export const routes = ["foreign"];\n');
      await workspace.writeText('postcss.config.mjs', 'export default { foreign: true };\n');

      const result = await workspace.run([
        'add',
        'message',
        '--yes',
        '--force',
        '--no-install',
        '--package-manager',
        'npm',
      ]);

      result.assertExitCode(0);
      expect(await workspace.readText('libs/dux-ui/message/message.ts')).toBe(generated);
      expect(await workspace.readText('src/app/app.config.ts')).toBe(
        'export const appConfig = "foreign";\n',
      );
      expect(await workspace.readText('src/app/app.routes.ts')).toBe(
        'export const routes = ["foreign"];\n',
      );
      expect(await workspace.readText('postcss.config.mjs')).toBe(
        'export default { foreign: true };\n',
      );
    });
  });

  it('--force never overwrites foreign generated targets', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      await mkdir(workspace.resolve('libs/dux-ui/markdown'), { recursive: true });
      await workspace.writeText(
        'libs/dux-ui/markdown/markdown.ts',
        'export const foreign = true;\n',
      );
      const result = await workspace.run([
        'add',
        'message',
        '--yes',
        '--force',
        '--no-install',
        '--package-manager',
        'npm',
      ]);

      result.assertExitCode(1);
      expect(await workspace.readText('libs/dux-ui/markdown/markdown.ts')).toBe(
        'export const foreign = true;\n',
      );
      result.assertReadOnly();
    });
  });

  it('--force rejects a generated target replaced by a symlink after planning', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      const initial = await workspace.run([
        'add',
        'message',
        '--yes',
        '--no-install',
        '--package-manager',
        'npm',
      ]);
      initial.assertExitCode(0);
      const target = 'libs/dux-ui/message/message.ts';
      await workspace.writeText(target, 'export const customized = true;\n');
      await workspace.writeText('src/app/app.config.ts', 'export const protectedValue = true;\n');
      await workspace.writeExecutable(
        '.test-bin/npm',
        [
          '#!/bin/sh',
          'if [ ! -L "$DUXKIT_TARGET" ]; then',
          '  mv "$DUXKIT_TARGET" "$DUXKIT_TARGET.original"',
          '  ln -s "$DUXKIT_FOREIGN" "$DUXKIT_TARGET"',
          'fi',
        ].join('\n') + '\n',
      );
      const result = await workspace.run(
        ['add', 'message', '--yes', '--force', '--package-manager', 'npm'],
        {
          DUXKIT_FOREIGN: workspace.resolve('src/app/app.config.ts'),
          DUXKIT_TARGET: workspace.resolve(target),
          PATH: `${workspace.resolve('.test-bin')}:${process.env.PATH ?? ''}`,
        },
      );

      result.assertExitCode(1);
      result.assertStderrIncludes('Refusing to overwrite a non-file or symlink target');
      expect(await workspace.readText('src/app/app.config.ts')).toBe(
        'export const protectedValue = true;\n',
      );
      result.assertFileUnchanged('duxkit-ai.json');
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
      expect(parsed.componentDestination).toBe('libs/dux-ui');
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

  it('uses the shared Nx library default and resolves aliases', async () => {
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
          componentDestination: 'libs/dux-ui',
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
        '--library-path',
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

  it('blocks unsafe library paths during preflight', async () => {
    await withCliFixtureWorkspace('nx-workspace', async (workspace) => {
      const result = await workspace.run([
        'add',
        'message',
        '--library-path',
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
      result.assertStdoutIncludes('Available components');
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

  it('detects installed primitives from the legacy default without duxkit config', async () => {
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
      expect(parsed.componentDestination).toBe('libs/dux-ui');
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
