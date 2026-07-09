import { execFile } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { promisify } from 'node:util';
import { readPrimitiveTemplate } from './primitive-templates.js';
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
    cause: unknown,
  ) {
    super(`Add failed: ${errorMessage(cause)}`, { cause });
  }
}

interface ApplyStep {
  readonly id: string;
  readonly run: () => Promise<void>;
}

export async function applyAddPlan(
  plan: AddPlan,
  options: AddApplyOptions,
): Promise<AddApplyResult> {
  const completedSteps: string[] = [];
  const completedPrimitives = new Set<string>();
  const steps = createApplySteps(plan, options, completedPrimitives);

  for (const [index, step] of steps.entries()) {
    try {
      await step.run();
      completedSteps.push(step.id);
    } catch (error) {
      throw new AddApplyError(
        completedSteps,
        steps.slice(index).map((pending) => pending.id),
        error,
      );
    }
  }

  return {
    completedPrimitives: [...completedPrimitives],
    completedSteps,
    skippedInstall: options.noInstall && plan.packages.missing.length > 0,
  };
}

function createApplySteps(
  plan: AddPlan,
  options: AddApplyOptions,
  completedPrimitives: Set<string>,
): readonly ApplyStep[] {
  const steps: ApplyStep[] = [];
  const primitiveIds = [...new Set(plan.files.map((file) => file.primitive))];

  if (plan.packages.missing.length > 0) {
    steps.push({
      id: options.noInstall ? 'dependencies skipped (--no-install)' : 'dependencies installed',
      run: options.noInstall ? async () => undefined : () => installDependencies(plan),
    });
  }

  for (const primitive of primitiveIds) {
    const files = plan.files.filter((file) => file.primitive === primitive);
    const writableFiles = files.filter((file) => isWritableAddFile(plan.force, file));

    if (writableFiles.length > 0) {
      steps.push({
        id: `primitive ${primitive} files written`,
        run: async () => {
          await writePrimitiveFiles(plan, writableFiles);
          completedPrimitives.add(primitive);
        },
      });
    } else {
      steps.push({
        id: `primitive ${primitive} files verified`,
        run: async () => {
          completedPrimitives.add(primitive);
        },
      });
    }
  }

  if (plan.stylesheetPlan?.action === 'add') {
    steps.push({
      id: 'global stylesheet written',
      run: () => writeGlobalStylesheet(plan),
    });
  }

  if (plan.config !== null && plan.config.action !== 'unchanged') {
    steps.push({
      id: 'duxkit-ai.json updated',
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

async function writePrimitiveFiles(plan: AddPlan, files: readonly AddFilePlan[]): Promise<void> {
  for (const file of files) {
    const content = await readPrimitiveTemplate(file.primitive, file.file);
    const target = join(plan.workspace.root, file.path);

    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, content, {
      encoding: 'utf8',
      flag: file.status === 'create' ? 'wx' : 'w',
    });
  }
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
