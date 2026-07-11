import { execFile } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import {
  executeMutationSteps,
  MutationStepExecutionError,
  type MutationStep,
  type MutationStepResult,
} from './mutation-steps.js';
import type { InitPlan } from './init-plan.js';

const execFileAsync = promisify(execFile);

export interface InitApplyOptions {
  readonly noInstall: boolean;
}

export interface InitApplyResult {
  readonly completedSteps: readonly string[];
  readonly skippedInstall: boolean;
}

export class InitApplyError extends Error {
  constructor(
    readonly completedSteps: readonly string[],
    readonly pendingSteps: readonly string[],
    readonly partialChanges: boolean,
    cause: unknown,
  ) {
    super(`Init failed: ${errorMessage(cause)}`, { cause });
  }
}

export async function applyInitPlan(
  plan: InitPlan,
  options: InitApplyOptions,
): Promise<InitApplyResult> {
  const steps = createApplySteps(plan, options);
  let result: MutationStepResult;

  try {
    result = await executeMutationSteps(steps);
  } catch (error) {
    if (!(error instanceof MutationStepExecutionError)) {
      throw error;
    }

    throw new InitApplyError(
      error.completedSteps,
      error.pendingSteps,
      error.partialChanges,
      error.cause,
    );
  }

  return {
    completedSteps: result.completedSteps,
    skippedInstall: options.noInstall && plan.packages.missing.length > 0,
  };
}

function createApplySteps(plan: InitPlan, options: InitApplyOptions): readonly MutationStep[] {
  const steps: MutationStep[] = [];

  if (plan.packages.missing.length > 0) {
    steps.push({
      id: options.noInstall ? 'dependencies skipped (--no-install)' : 'dependencies installed',
      mutates: !options.noInstall,
      run: options.noInstall ? async () => undefined : () => installDependencies(plan),
    });
  }

  if (plan.config?.action !== undefined && plan.config.action !== 'unchanged') {
    steps.push({ id: 'duxkit-ai.json written', mutates: true, run: () => writeConfig(plan) });
  }

  if (
    plan.postcss !== null &&
    (plan.postcss.action === 'create' || plan.postcss.action === 'update')
  ) {
    steps.push({ id: 'PostCSS config written', mutates: true, run: () => writePostCss(plan) });
  }

  if (stylesheetHasChanges(plan)) {
    steps.push({ id: 'stylesheet written', mutates: true, run: () => writeStylesheet(plan) });
  }

  if (plan.directory?.action === 'create') {
    steps.push({
      id: 'components directory created',
      mutates: true,
      run: () => createComponentsDirectory(plan),
    });
  }

  return steps;
}

function stylesheetHasChanges(plan: InitPlan): boolean {
  return (
    plan.tokens?.action === 'add' ||
    (plan.tailwind?.action === 'add' &&
      (plan.tailwind.imports.length > 0 ||
        (plan.tailwind.sourceRequired && plan.tailwind.sourceCoverage === 'missing')))
  );
}

async function installDependencies(plan: InitPlan): Promise<void> {
  for (const dependencyGroup of ['dependencies', 'devDependencies'] as const) {
    const dependencies = plan.packages.missing.filter(
      (dependency) => dependency.section === dependencyGroup,
    );

    if (dependencies.length === 0) {
      continue;
    }

    const args = [
      plan.packageManager === 'npm' ? 'install' : 'add',
      ...(dependencyGroup === 'devDependencies' ? ['-D'] : []),
      ...dependencies.map((dependency) => `${dependency.name}@${dependency.version}`),
    ];

    await execFileAsync(plan.packageManager, args, {
      cwd: plan.workspace.root,
      encoding: 'utf8',
      maxBuffer: 1024 * 1024,
    });
  }
}

async function writeConfig(plan: InitPlan): Promise<void> {
  if (plan.config === null || plan.config.action === 'unchanged') {
    return;
  }

  await writeJson(plan.workspace.root, plan.config.path, plan.config.after);
}

async function writePostCss(plan: InitPlan): Promise<void> {
  if (
    plan.postcss === null ||
    plan.postcss.path === null ||
    plan.postcss.after === null ||
    (plan.postcss.action !== 'create' && plan.postcss.action !== 'update')
  ) {
    return;
  }

  await writeJson(plan.workspace.root, plan.postcss.path, plan.postcss.after);
}

async function writeStylesheet(plan: InitPlan): Promise<void> {
  if (plan.stylesheet === null) {
    return;
  }

  const path = join(plan.workspace.root, plan.stylesheet);
  const existing = await readFile(path, 'utf8');
  const additions: string[] = [];

  if (plan.tailwind?.action === 'add') {
    additions.push(...plan.tailwind.imports);

    if (plan.tailwind.sourceRequired && plan.tailwind.sourceCoverage === 'missing') {
      additions.push(`@source '${plan.tailwind.sourcePath}';`);
    }
  }

  if (plan.tokens?.action === 'add') {
    additions.push(
      ['/* Duxkit AI theme tokens */', ':root {', ...plan.tokens.declarations, '}'].join('\n'),
    );
  }

  if (additions.length === 0) {
    return;
  }

  const separator = existing.endsWith('\n') ? '\n' : '\n\n';
  await writeFile(path, `${existing}${separator}${additions.join('\n')}\n`);
}

async function createComponentsDirectory(plan: InitPlan): Promise<void> {
  if (plan.directory?.action !== 'create') {
    return;
  }

  await mkdir(join(plan.workspace.root, plan.directory.path), { recursive: true });
}

async function writeJson(
  workspaceRoot: string,
  path: string,
  value: Readonly<Record<string, unknown>>,
): Promise<void> {
  await writeFile(join(workspaceRoot, path), `${JSON.stringify(value, null, 2)}\n`);
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
