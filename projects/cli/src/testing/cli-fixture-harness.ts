import { chmod, cp, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runCli, type CliIo } from '../lib/cli.js';

export type CliFixtureName = 'angular-cli-app' | 'nx-workspace';

export type PackageDependencySection =
  | 'dependencies'
  | 'devDependencies'
  | 'peerDependencies'
  | 'optionalDependencies';

export interface FileChange {
  readonly path: string;
  readonly type: 'created' | 'deleted' | 'modified';
}

export interface PackageDependencyChange {
  readonly name: string;
  readonly section: PackageDependencySection;
  readonly type: 'added' | 'removed' | 'changed';
  readonly before: string | undefined;
  readonly after: string | undefined;
}

export interface CliFixtureCommandResult {
  readonly argv: readonly string[];
  readonly exitCode: number;
  readonly stderr: string;
  readonly stdout: string;
  readonly workspace: CliFixtureWorkspace;
  readonly before: WorkspaceSnapshot;
  readonly after: WorkspaceSnapshot;
  readonly fileChanges: readonly FileChange[];
  readonly packageChanges: readonly PackageDependencyChange[];
  assertExitCode(expected: number): void;
  assertFileChanged(path: string): void;
  assertFileUnchanged(path: string): void;
  assertPackageDependency(
    section: PackageDependencySection,
    name: string,
    expectedVersion: string,
  ): void;
  assertPackageDependencyChange(
    section: PackageDependencySection,
    name: string,
    expected: {
      readonly after?: string;
      readonly before?: string;
      readonly type: PackageDependencyChange['type'];
    },
  ): void;
  assertReadOnly(): void;
  assertSourceFixtureUnchanged(): void;
  assertStderrIncludes(text: string): void;
  assertStdoutIncludes(text: string): void;
}

export interface CliFixtureInteraction {
  readonly confirmations: readonly boolean[];
}

export class WorkspaceSnapshot {
  readonly packageJson: PackageManifest | null;

  constructor(
    readonly root: string,
    readonly files: ReadonlyMap<string, string>,
  ) {
    const packageJson = files.get('package.json');
    this.packageJson = packageJson === undefined ? null : parsePackageManifest(packageJson);
  }

  file(path: string): string | undefined {
    return this.files.get(normalizeWorkspacePath(path));
  }
}

export class CliFixtureWorkspace {
  readonly sourceFixtureRoot: string;

  private constructor(
    readonly fixtureName: CliFixtureName,
    readonly root: string,
  ) {
    this.sourceFixtureRoot = getFixtureRoot(fixtureName);
  }

  static async create(fixtureName: CliFixtureName): Promise<CliFixtureWorkspace> {
    const sourceFixtureRoot = getFixtureRoot(fixtureName);
    const tempParent = await mkdtemp(join(tmpdir(), 'duxkit-ui-cli-'));
    const workspaceRoot = join(tempParent, fixtureName);

    await cp(sourceFixtureRoot, workspaceRoot, {
      errorOnExist: true,
      force: false,
      recursive: true,
    });

    return new CliFixtureWorkspace(fixtureName, workspaceRoot);
  }

  async cleanup(): Promise<void> {
    await rm(dirname(this.root), {
      force: true,
      recursive: true,
    });
  }

  async readText(path: string): Promise<string> {
    return readFile(this.resolve(path), 'utf8');
  }

  resolve(path = '.'): string {
    const resolvedPath = resolve(this.root, path);
    const relativePath = relative(this.root, resolvedPath);

    if (
      relativePath.startsWith('..') ||
      relativePath === '..' ||
      relativePath.includes(`..${sep}`)
    ) {
      throw new Error(`Fixture path escapes workspace root: ${path}`);
    }

    return resolvedPath;
  }

  async run(
    argv: readonly string[],
    environment: Readonly<Record<string, string>> = {},
    interaction?: CliFixtureInteraction,
  ): Promise<CliFixtureCommandResult> {
    const sourceBefore = await snapshotWorkspace(this.sourceFixtureRoot);
    const before = await this.snapshot();
    let stderr = '';
    let stdout = '';
    const confirmations = [...(interaction?.confirmations ?? [])];
    const io: CliIo = {
      confirm:
        interaction === undefined
          ? undefined
          : async (message) => {
              stderr += `${message} (y/N) `;
              const answer = confirmations.shift();

              if (answer === undefined) {
                throw new Error(`No fixture confirmation answer remains for: ${message}`);
              }

              stderr += `${answer ? 'y' : 'n'}\n`;
              return answer;
            },
      interactive: interaction === undefined ? false : true,
      stderr: {
        write: (chunk) => {
          stderr += chunk;
        },
      },
      stdout: {
        write: (chunk) => {
          stdout += chunk;
        },
      },
    };

    const previousCwd = process.cwd();
    const environmentKeys = new Set([...Object.keys(environment), 'npm_config_user_agent']);
    const previousEnvironment = new Map(
      [...environmentKeys].map((key) => [key, process.env[key]] as const),
    );
    let exitCode: number;

    try {
      if (!Object.hasOwn(environment, 'npm_config_user_agent')) {
        delete process.env['npm_config_user_agent'];
      }

      for (const [key, value] of Object.entries(environment)) {
        process.env[key] = value;
      }

      process.chdir(this.root);
      exitCode = await runCli(argv, io);
    } finally {
      process.chdir(previousCwd);

      for (const [key, value] of previousEnvironment) {
        if (value === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = value;
        }
      }
    }

    const after = await this.snapshot();
    const sourceAfter = await snapshotWorkspace(this.sourceFixtureRoot);
    const sourceFixtureChanges = diffSnapshots(sourceBefore, sourceAfter);
    const fileChanges = diffSnapshots(before, after);
    const packageChanges = diffPackageDependencies(before.packageJson, after.packageJson);

    return new FixtureCommandResult({
      after,
      argv,
      before,
      exitCode,
      fileChanges,
      packageChanges,
      sourceFixtureChanges,
      stderr,
      stdout,
      workspace: this,
    });
  }

  async runDryRun(argv: readonly string[]): Promise<CliFixtureCommandResult> {
    const dryRunArgv = argv.includes('--dry-run') ? argv : [...argv, '--dry-run'];
    const result = await this.run(dryRunArgv);

    result.assertReadOnly();

    return result;
  }

  async snapshot(): Promise<WorkspaceSnapshot> {
    return snapshotWorkspace(this.root);
  }

  async writeText(path: string, text: string): Promise<void> {
    await writeFile(this.resolve(path), text);
  }

  async writeExecutable(path: string, text: string): Promise<void> {
    const absolutePath = this.resolve(path);
    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, text);
    await chmod(absolutePath, 0o755);
  }
}

interface FixtureCommandResultOptions {
  readonly after: WorkspaceSnapshot;
  readonly argv: readonly string[];
  readonly before: WorkspaceSnapshot;
  readonly exitCode: number;
  readonly fileChanges: readonly FileChange[];
  readonly packageChanges: readonly PackageDependencyChange[];
  readonly sourceFixtureChanges: readonly FileChange[];
  readonly stderr: string;
  readonly stdout: string;
  readonly workspace: CliFixtureWorkspace;
}

class FixtureCommandResult implements CliFixtureCommandResult {
  readonly after: WorkspaceSnapshot;
  readonly argv: readonly string[];
  readonly before: WorkspaceSnapshot;
  readonly exitCode: number;
  readonly fileChanges: readonly FileChange[];
  readonly packageChanges: readonly PackageDependencyChange[];
  readonly sourceFixtureChanges: readonly FileChange[];
  readonly stderr: string;
  readonly stdout: string;
  readonly workspace: CliFixtureWorkspace;

  constructor(options: FixtureCommandResultOptions) {
    this.after = options.after;
    this.argv = options.argv;
    this.before = options.before;
    this.exitCode = options.exitCode;
    this.fileChanges = options.fileChanges;
    this.packageChanges = options.packageChanges;
    this.sourceFixtureChanges = options.sourceFixtureChanges;
    this.stderr = options.stderr;
    this.stdout = options.stdout;
    this.workspace = options.workspace;
  }

  assertExitCode(expected: number): void {
    if (this.exitCode !== expected) {
      throw new Error(`Expected exit code ${expected}, received ${this.exitCode}.`);
    }
  }

  assertFileChanged(path: string): void {
    const normalizedPath = normalizeWorkspacePath(path);
    const changed = this.fileChanges.some((change) => change.path === normalizedPath);

    if (!changed) {
      throw new Error(`Expected ${normalizedPath} to change.`);
    }
  }

  assertFileUnchanged(path: string): void {
    const normalizedPath = normalizeWorkspacePath(path);
    const changed = this.fileChanges.some((change) => change.path === normalizedPath);

    if (changed) {
      throw new Error(`Expected ${normalizedPath} to remain unchanged.`);
    }
  }

  assertPackageDependency(
    section: PackageDependencySection,
    name: string,
    expectedVersion: string,
  ): void {
    const actualVersion = this.after.packageJson?.[section]?.[name];

    if (actualVersion !== expectedVersion) {
      throw new Error(
        `Expected package.json ${section}.${name} to be ${expectedVersion}, received ${String(
          actualVersion,
        )}.`,
      );
    }
  }

  assertPackageDependencyChange(
    section: PackageDependencySection,
    name: string,
    expected: {
      readonly after?: string;
      readonly before?: string;
      readonly type: PackageDependencyChange['type'];
    },
  ): void {
    const change = this.packageChanges.find(
      (candidate) => candidate.section === section && candidate.name === name,
    );

    if (
      change === undefined ||
      change.type !== expected.type ||
      change.before !== expected.before ||
      change.after !== expected.after
    ) {
      throw new Error(
        `Expected package change ${section}.${name} to be ${JSON.stringify(
          expected,
        )}, received ${JSON.stringify(change)}.`,
      );
    }
  }

  assertReadOnly(): void {
    if (this.fileChanges.length > 0 || this.packageChanges.length > 0) {
      const changedPaths = this.fileChanges.map((change) => `${change.type}:${change.path}`);
      const packageChanges = this.packageChanges.map(
        (change) => `${change.type}:${change.section}.${change.name}`,
      );

      throw new Error(
        `Expected command to be read-only, but saw changes: ${[
          ...changedPaths,
          ...packageChanges,
        ].join(', ')}`,
      );
    }
  }

  assertSourceFixtureUnchanged(): void {
    if (this.sourceFixtureChanges.length > 0) {
      const changedPaths = this.sourceFixtureChanges.map(
        (change) => `${change.type}:${change.path}`,
      );

      throw new Error(`Source fixture changed: ${changedPaths.join(', ')}`);
    }
  }

  assertStderrIncludes(text: string): void {
    if (!this.stderr.includes(text)) {
      throw new Error(`Expected stderr to include ${JSON.stringify(text)}.`);
    }
  }

  assertStdoutIncludes(text: string): void {
    if (!this.stdout.includes(text)) {
      throw new Error(`Expected stdout to include ${JSON.stringify(text)}.`);
    }
  }
}

export async function withCliFixtureWorkspace<T>(
  fixtureName: CliFixtureName,
  callback: (workspace: CliFixtureWorkspace) => Promise<T>,
): Promise<T> {
  const workspace = await CliFixtureWorkspace.create(fixtureName);

  try {
    return await callback(workspace);
  } finally {
    await workspace.cleanup();
  }
}

export function diffSnapshots(
  before: WorkspaceSnapshot,
  after: WorkspaceSnapshot,
): readonly FileChange[] {
  const changes: FileChange[] = [];
  const paths = [...new Set([...before.files.keys(), ...after.files.keys()])].sort();

  for (const path of paths) {
    const beforeText = before.files.get(path);
    const afterText = after.files.get(path);

    if (beforeText === undefined && afterText !== undefined) {
      changes.push({ path, type: 'created' });
    } else if (beforeText !== undefined && afterText === undefined) {
      changes.push({ path, type: 'deleted' });
    } else if (beforeText !== afterText) {
      changes.push({ path, type: 'modified' });
    }
  }

  return changes;
}

interface PackageManifest {
  readonly dependencies: Readonly<Record<string, string>>;
  readonly devDependencies: Readonly<Record<string, string>>;
  readonly peerDependencies: Readonly<Record<string, string>>;
  readonly optionalDependencies: Readonly<Record<string, string>>;
}

const packageDependencySections: readonly PackageDependencySection[] = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
];

const ignoredSnapshotDirectories = new Set(['.angular', '.nx', 'coverage', 'dist', 'node_modules']);
const fixturesRoot = fileURLToPath(new URL('./fixtures/', import.meta.url));

async function snapshotWorkspace(root: string): Promise<WorkspaceSnapshot> {
  const files = new Map<string, string>();
  await readSnapshotFiles(root, root, files);

  return new WorkspaceSnapshot(root, files);
}

async function readSnapshotFiles(
  root: string,
  directory: string,
  files: Map<string, string>,
): Promise<void> {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.isDirectory() && ignoredSnapshotDirectories.has(entry.name)) {
      continue;
    }

    const absolutePath = join(directory, entry.name);

    if (entry.isDirectory()) {
      await readSnapshotFiles(root, absolutePath, files);
      continue;
    }

    if (entry.isFile()) {
      const relativePath = normalizeWorkspacePath(relative(root, absolutePath));
      files.set(relativePath, await readFile(absolutePath, 'utf8'));
    }
  }
}

function diffPackageDependencies(
  before: PackageManifest | null,
  after: PackageManifest | null,
): readonly PackageDependencyChange[] {
  const changes: PackageDependencyChange[] = [];

  for (const section of packageDependencySections) {
    const beforeDependencies = before?.[section] ?? {};
    const afterDependencies = after?.[section] ?? {};
    const names = [
      ...new Set([...Object.keys(beforeDependencies), ...Object.keys(afterDependencies)]),
    ].sort();

    for (const name of names) {
      const beforeVersion = beforeDependencies[name];
      const afterVersion = afterDependencies[name];

      if (beforeVersion === afterVersion) {
        continue;
      }

      changes.push({
        after: afterVersion,
        before: beforeVersion,
        name,
        section,
        type:
          beforeVersion === undefined
            ? 'added'
            : afterVersion === undefined
              ? 'removed'
              : 'changed',
      });
    }
  }

  return changes;
}

function getFixtureRoot(fixtureName: CliFixtureName): string {
  return join(fixturesRoot, fixtureName);
}

function normalizeWorkspacePath(path: string): string {
  return path.split(sep).join('/');
}

function parsePackageManifest(text: string): PackageManifest {
  const parsed: unknown = JSON.parse(text);

  if (!isJsonObject(parsed)) {
    throw new Error('Expected package.json to contain an object.');
  }

  return {
    dependencies: readStringRecord(parsed, 'dependencies'),
    devDependencies: readStringRecord(parsed, 'devDependencies'),
    optionalDependencies: readStringRecord(parsed, 'optionalDependencies'),
    peerDependencies: readStringRecord(parsed, 'peerDependencies'),
  };
}

function readStringRecord(
  source: Readonly<Record<string, unknown>>,
  key: PackageDependencySection,
): Readonly<Record<string, string>> {
  const value = source[key];

  if (value === undefined) {
    return {};
  }

  if (!isJsonObject(value)) {
    throw new Error(`Expected package.json ${key} to contain an object.`);
  }

  const result: Record<string, string> = {};

  for (const [name, version] of Object.entries(value)) {
    if (typeof version !== 'string') {
      throw new Error(`Expected package.json ${key}.${name} to contain a string.`);
    }

    result[name] = version;
  }

  return result;
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
