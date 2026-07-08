import { describe, expect, it } from 'vitest';
import { diffSnapshots, withCliFixtureWorkspace } from './cli-fixture-harness.js';

describe('CLI fixture harness', () => {
  it('copies Angular CLI app fixtures to a temporary workspace and runs commands inside them', async () => {
    await withCliFixtureWorkspace('angular-cli-app', async (workspace) => {
      const result = await workspace.run(['inspect']);

      result.assertExitCode(1);
      result.assertStderrIncludes('duxkit-ui inspect is scaffolded but not implemented yet.');
      result.assertSourceFixtureUnchanged();

      expect(workspace.root).not.toBe(workspace.sourceFixtureRoot);
      expect(await workspace.readText('angular.json')).toContain('"fixture-app"');
    });
  });

  it('copies Nx workspace fixtures to a temporary workspace and runs commands inside them', async () => {
    await withCliFixtureWorkspace('nx-workspace', async (workspace) => {
      const result = await workspace.run(['list', '--json']);

      result.assertExitCode(1);
      result.assertStderrIncludes('duxkit-ui list is scaffolded but not implemented yet.');
      result.assertSourceFixtureUnchanged();

      expect(await workspace.readText('nx.json')).toContain('"npmScope": "fixture"');
      expect(result.stdout).toBe('');
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
});
