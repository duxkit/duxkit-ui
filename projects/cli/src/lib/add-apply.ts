import { execFile } from 'node:child_process';
import { constants } from 'node:fs';
import { lstat, mkdir, open, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { promisify } from 'node:util';
import { readPrimitiveTemplate } from './primitive-templates.js';
import {
  executeMutationSteps,
  MutationStepExecutionError,
  type MutationStep,
  type MutationStepResult,
} from './mutation-steps.js';
import { checksumText } from './text-checksum.js';
import {
  isRecord,
  isWritableAddFile,
  readJsonRecord,
  stylesheetHasSource,
  type AddFilePlan,
  type AddPlan,
} from './add-plan.js';

const execFileAsync = promisify(execFile);

export interface AddApplyOptions {
  readonly noInstall: boolean;
}

export interface AddApplyResult {
  readonly completedPrimitives: readonly string[];
  readonly completedSteps: readonly string[];
  readonly skippedInstall: boolean;
}

export class AddApplyError extends Error {
  constructor(
    readonly completedSteps: readonly string[],
    readonly pendingSteps: readonly string[],
    readonly partialChanges: boolean,
    cause: unknown,
  ) {
    super(`Add failed: ${errorMessage(cause)}`, { cause });
  }
}

export async function applyAddPlan(
  plan: AddPlan,
  options: AddApplyOptions,
): Promise<AddApplyResult> {
  const completedPrimitives = new Set<string>();
  const steps = createApplySteps(plan, options, completedPrimitives);
  let result: MutationStepResult;

  try {
    result = await executeMutationSteps(steps);
  } catch (error) {
    if (!(error instanceof MutationStepExecutionError)) {
      throw error;
    }

    throw new AddApplyError(
      error.completedSteps,
      error.pendingSteps,
      error.partialChanges,
      error.cause,
    );
  }

  return {
    completedPrimitives: [...completedPrimitives],
    completedSteps: result.completedSteps,
    skippedInstall: options.noInstall && plan.packages.missing.length > 0,
  };
}

function createApplySteps(
  plan: AddPlan,
  options: AddApplyOptions,
  completedPrimitives: Set<string>,
): readonly MutationStep[] {
  const steps: MutationStep[] = [];
  const primitiveIds = [...new Set(plan.files.map((file) => file.primitive))];

  if (plan.packages.missing.length > 0) {
    steps.push({
      id: options.noInstall ? 'dependencies skipped (--no-install)' : 'dependencies installed',
      mutates: !options.noInstall,
      run: options.noInstall ? async () => undefined : () => installDependencies(plan),
    });
  }

  for (const primitive of primitiveIds) {
    const files = plan.files.filter((file) => file.primitive === primitive);
    const writableFiles = files.filter((file) => isWritableAddFile(plan.force, file));

    if (writableFiles.length > 0) {
      for (const file of writableFiles) {
        steps.push({
          id: `primitive ${primitive} file ${file.file} written`,
          mutates: true,
          run: () => writePrimitiveFile(plan, file),
        });
      }

      steps.push({
        id: `primitive ${primitive} files written`,
        mutates: false,
        run: async () => {
          completedPrimitives.add(primitive);
        },
      });
    } else {
      steps.push({
        id: `primitive ${primitive} files verified`,
        mutates: false,
        run: async () => {
          completedPrimitives.add(primitive);
        },
      });
    }
  }

  if (plan.stylesheetPlan?.action === 'add') {
    steps.push({
      id: 'global stylesheet written',
      mutates: true,
      run: () => writeGlobalStylesheet(plan),
    });
  }

  if (plan.config !== null && plan.config.action !== 'unchanged') {
    steps.push({
      id: 'duxkit-ai.json updated',
      mutates: true,
      run: () => writeConfigForCompletedPrimitives(plan, new Set(primitiveIds)),
    });
  }

  return steps;
}

async function installDependencies(plan: AddPlan): Promise<void> {
  for (const section of ['dependencies', 'devDependencies', 'peerDependencies'] as const) {
    const dependencies = plan.packages.missing.filter(
      (dependency) => dependency.section === section,
    );

    if (dependencies.length === 0) {
      continue;
    }

    const args = [
      plan.packageManager === 'npm' ? 'install' : 'add',
      ...(section === 'devDependencies' ? ['-D'] : []),
      ...dependencies.map((dependency) => `${dependency.name}@${dependency.version}`),
    ];

    await execFileAsync(plan.packageManager, args, {
      cwd: plan.workspace.root,
      encoding: 'utf8',
      maxBuffer: 1024 * 1024,
    });
  }
}

async function writePrimitiveFile(plan: AddPlan, file: AddFilePlan): Promise<void> {
  const content = await readPrimitiveTemplate(file.primitive, file.file);
  const target = resolve(plan.workspace.root, file.path);
  assertTargetInsideDestination(plan, target);
  await assertNoSymlinkAncestors(plan.workspace.root, dirname(target));
  await mkdir(dirname(target), { recursive: true });
  await assertNoSymlinkAncestors(plan.workspace.root, dirname(target));

  if (file.status === 'create') {
    const handle = await open(
      target,
      constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY | constants.O_NOFOLLOW,
      0o666,
    );

    try {
      await handle.writeFile(content, 'utf8');
    } finally {
      await handle.close();
    }
    return;
  }

  if (file.status !== 'customized' || file.checksum === undefined) {
    throw new Error(`Refusing to overwrite unverified generated target: ${file.path}.`);
  }

  const before = await lstat(target);

  if (!before.isFile() || before.isSymbolicLink()) {
    throw new Error(`Refusing to overwrite a non-file or symlink target: ${file.path}.`);
  }

  const existing = await readFile(target, 'utf8');

  if (checksumText(existing) !== file.checksum) {
    throw new Error(`The generated target changed after planning: ${file.path}.`);
  }

  const handle = await open(target, constants.O_WRONLY | constants.O_NOFOLLOW);

  try {
    const opened = await handle.stat();

    if (!opened.isFile() || opened.dev !== before.dev || opened.ino !== before.ino) {
      throw new Error(`The generated target changed while opening it: ${file.path}.`);
    }

    await handle.truncate(0);
    await handle.writeFile(content, 'utf8');
  } finally {
    await handle.close();
  }
}

function assertTargetInsideDestination(plan: AddPlan, target: string): void {
  if (plan.componentDestination === null) {
    throw new Error('The configured library path is missing.');
  }

  const destination = resolve(plan.workspace.root, plan.componentDestination);
  const targetRelative = relative(destination, target);

  if (targetRelative === '' || targetRelative === '..' || targetRelative.startsWith(`..${sep}`)) {
    throw new Error(`Refusing to write outside the configured library path: ${target}.`);
  }
}

async function assertNoSymlinkAncestors(workspaceRoot: string, directory: string): Promise<void> {
  const root = resolve(workspaceRoot);
  const directoryRelative = relative(root, directory);

  if (directoryRelative === '..' || directoryRelative.startsWith(`..${sep}`)) {
    throw new Error(`Generated target directory escapes the workspace: ${directory}.`);
  }

  let current = root;

  for (const segment of directoryRelative.split(sep).filter((value) => value.length > 0)) {
    current = join(current, segment);

    try {
      if ((await lstat(current)).isSymbolicLink()) {
        throw new Error(`Generated target directory contains a symlink: ${current}.`);
      }
    } catch (error) {
      if (isNodeError(error) && error.code === 'ENOENT') {
        return;
      }

      throw error;
    }
  }
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}

async function writeConfigForCompletedPrimitives(
  plan: AddPlan,
  completedPrimitives: ReadonlySet<string>,
): Promise<void> {
  if (plan.config === null || plan.config.action === 'unchanged') {
    return;
  }

  const path = join(plan.workspace.root, plan.config.path);
  const existing = await readJsonRecord(path);
  const after = existing === null ? { ...plan.config.after } : { ...existing };
  const plannedPrimitives = plan.config.after['primitives'];
  const currentPrimitives = existing?.['primitives'];
  const plannedComponentsPath = plan.config.after['componentsPath'];
  const plannedTailwind = plan.config.after['tailwind'];

  if (typeof plannedComponentsPath === 'string') {
    after['componentsPath'] = plannedComponentsPath;
  }

  if (isRecord(plannedTailwind)) {
    after['tailwind'] = {
      ...(isRecord(after['tailwind']) ? after['tailwind'] : {}),
      ...plannedTailwind,
    };
  }

  after['primitives'] = mergeCompletedPrimitives(
    currentPrimitives,
    plannedPrimitives,
    completedPrimitives,
  );

  await writeFile(path, `${JSON.stringify(after, null, 2)}\n`);
}

function mergeCompletedPrimitives(
  current: unknown,
  planned: unknown,
  completed: ReadonlySet<string>,
): readonly string[] | Readonly<Record<string, unknown>> {
  if (Array.isArray(current) || Array.isArray(planned)) {
    const values = Array.isArray(current)
      ? current.filter((value): value is string => typeof value === 'string')
      : [];
    const plannedValues = Array.isArray(planned) ? planned : [];

    for (const primitive of plannedValues) {
      if (
        typeof primitive === 'string' &&
        completed.has(primitive) &&
        !values.includes(primitive)
      ) {
        values.push(primitive);
      }
    }

    return values;
  }

  const values: Record<string, unknown> = isRecord(current) ? { ...current } : {};
  const plannedValues = isRecord(planned) ? planned : {};

  for (const primitive of completed) {
    if (primitive in plannedValues) {
      values[primitive] = plannedValues[primitive];
    }
  }

  return values;
}

async function writeGlobalStylesheet(plan: AddPlan): Promise<void> {
  const stylesheet = plan.stylesheetPlan;

  if (stylesheet === null || stylesheet.action !== 'add' || stylesheet.path === null) {
    return;
  }

  if (stylesheet.sourcePath === null) {
    throw new Error('The planned global stylesheet source path is missing.');
  }

  const path = join(plan.workspace.root, stylesheet.path);
  const existing = await readFile(path, 'utf8');

  if (stylesheetHasSource(existing, stylesheet.sourcePath)) {
    return;
  }

  const separator = existing.length === 0 || existing.endsWith('\n') ? '\n' : '\n\n';
  await writeFile(path, `${existing}${separator}@source '${stylesheet.sourcePath}';\n`, 'utf8');
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function renderAddImportPath(plan: AddPlan, primitive: string): string {
  const componentDestination = plan.componentDestination;

  if (componentDestination === null) {
    return `./${primitive}`;
  }

  const appDirectory =
    plan.project?.sourceRoot === null || plan.project?.sourceRoot === undefined
      ? (plan.project?.root ?? '')
      : join(plan.project.sourceRoot, 'app');
  const importPath = relative(appDirectory, join(componentDestination, primitive)).replace(
    /\\/g,
    '/',
  );

  return importPath.startsWith('.') ? importPath : `./${importPath}`;
}
