import { execFile } from 'node:child_process';
import { cp, mkdtemp, readFile, readdir, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const workspaceRoot = resolve(import.meta.dirname, '../../..');
const cliPath = join(workspaceRoot, 'dist/cli/index.js');
const fixtureRoot = join(workspaceRoot, 'projects/cli/src/testing/fixtures/angular-cli-app');
const tempRoot = await mkdtemp(join(tmpdir(), 'duxkit-ui-package-'));
const testWorkspace = join(tempRoot, 'workspace');

try {
  await cp(fixtureRoot, testWorkspace, { recursive: true });
  await symlink(
    join(workspaceRoot, 'node_modules'),
    join(testWorkspace, 'node_modules'),
    'junction',
  );
  const canonicalWorkspace = await realpath(testWorkspace);

  await run(cliPath, [
    'init',
    '--cwd',
    canonicalWorkspace,
    '--yes',
    '--no-install',
    '--package-manager',
    'npm',
    '--tokens',
    'add',
  ]);
  await run(cliPath, [
    'add',
    '--cwd',
    canonicalWorkspace,
    '--all',
    '--yes',
    '--no-install',
    '--package-manager',
    'npm',
  ]);

  const generatedRoot = join(canonicalWorkspace, 'libs/dux-ui');
  const generatedFiles = await collectFiles(generatedRoot);
  const generatedTypeScriptFiles = generatedFiles.filter((file) => file.endsWith('.ts'));

  if (generatedFiles.length !== 142) {
    throw new Error(`Expected 142 generated templates, found ${generatedFiles.length}.`);
  }

  for (const file of generatedTypeScriptFiles) {
    const source = await readFile(file, 'utf8');

    if (/from\s+['"](?:@duxkit-private|duxkit-ai(?:\/|['"]))/.test(source)) {
      throw new Error(`Packaged template contains a workspace-only import: ${file}`);
    }
  }

  await writeFile(
    join(canonicalWorkspace, 'tsconfig.smoke.json'),
    `${JSON.stringify(
      {
        extends: './tsconfig.json',
        compilerOptions: {
          experimentalDecorators: true,
          noEmit: true,
          skipLibCheck: true,
        },
        include: ['libs/**/*.ts', 'src/**/*.ts'],
      },
      null,
      2,
    )}\n`,
  );
  await run(join(workspaceRoot, 'node_modules/typescript/bin/tsc'), [
    '--project',
    join(canonicalWorkspace, 'tsconfig.smoke.json'),
  ]);

  console.log(`Packaged CLI generated and type-checked ${generatedFiles.length} templates`);
} finally {
  await rm(tempRoot, { force: true, recursive: true });
}

async function collectFiles(directory) {
  const files = [];

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(path)));
    } else {
      files.push(path);
    }
  }

  return files;
}

async function run(command, args) {
  try {
    await execFileAsync(process.execPath, [command, ...args], {
      cwd: workspaceRoot,
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch (error) {
    if (error instanceof Error && 'stdout' in error && 'stderr' in error) {
      process.stderr.write(String(error.stdout));
      process.stderr.write(String(error.stderr));
    }

    throw error;
  }
}
