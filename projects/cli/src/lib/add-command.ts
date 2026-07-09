import { resolve } from 'node:path';
import type { CliIo } from './cli.js';
import { CliCommandError } from './cli-errors.js';
import { createAddPlan, type AddPlan, type AddPlannerOptions } from './add-plan.js';

export interface AddCommandOptions extends AddPlannerOptions {
  readonly dryRun?: boolean;
  readonly json?: boolean;
}

export async function runAddCommand(
  inputs: readonly string[],
  options: AddCommandOptions,
  io: CliIo,
): Promise<void> {
  if (options.dryRun !== true) {
    io.stderr.write('Add mutations are not implemented yet. Rerun with --dry-run.\n');
    throw new CliCommandError(1);
  }

  const plan = await createAddPlan(inputs, options, resolve(options.cwd ?? process.cwd()));

  if (options.json === true) {
    io.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
  } else {
    io.stdout.write(renderHumanAdd(plan));
  }

  if (plan.status === 'blocked') {
    if (options.json !== true && plan.nextSteps.length > 0) {
      io.stderr.write(`${plan.nextSteps.join('\n')}\n`);
    }

    throw new CliCommandError(1);
  }
}

function renderHumanAdd(plan: AddPlan): string {
  const lines = [
    `Add plan (${plan.status})`,
    `  workspace: ${plan.workspace.root}`,
    `  type: ${plan.workspace.type}`,
    `  project: ${plan.project?.name ?? 'None'}`,
    `  component destination: ${plan.componentDestination ?? 'None'}`,
    `  package manager: ${plan.packageManager}`,
    '',
    'Requested primitives',
    ...renderPrimitiveIds(plan.requested),
    '',
    'Included dependencies',
    ...renderPrimitiveIds(plan.included),
    '',
    'Packages',
    ...renderPackages(plan),
    '',
    'Package install commands',
    ...renderInstallCommands(plan),
    '',
    'Generated files',
    ...renderFiles(plan.files),
    '',
    'Stylesheet changes',
    ...renderFiles(plan.stylesheetChanges),
    plan.stylesheetPlan === null || plan.stylesheetPlan.action === 'unchanged'
      ? '  Global stylesheet: unchanged'
      : `  Global stylesheet: [${plan.stylesheetPlan.action}] ${plan.stylesheetPlan.path ?? 'None'}${plan.stylesheetPlan.sourcePath === null ? '' : ` @source ${plan.stylesheetPlan.sourcePath}`}`,
    '',
    'Config changes',
    plan.config === null || plan.config.action === 'unchanged'
      ? '  None'
      : `  - [${plan.config.action}] ${plan.config.path}`,
    '',
    'Planned changes',
    ...renderPlannedChanges(plan),
  ];

  if (plan.conflicts.length > 0) {
    lines.push('', 'Conflicts', ...plan.conflicts.map(renderConflict));
  }

  if (plan.errors.length > 0) {
    lines.push('', 'Errors', ...plan.errors.map((error) => `  - ${error}`));
  }

  if (plan.warnings.length > 0) {
    lines.push('', 'Warnings', ...plan.warnings.map((warning) => `  - ${warning}`));
  }

  return `${lines.join('\n')}\n`;
}

function renderPrimitiveIds(ids: readonly string[]): readonly string[] {
  return ids.length === 0 ? ['  None'] : ids.map((id) => `  - ${id}`);
}

function renderPackages(plan: AddPlan): readonly string[] {
  if (plan.packages.required.length === 0) {
    return ['  None'];
  }

  const packages = plan.packages.required.map(
    (dependency) =>
      `  - [${dependency.status}] ${dependency.name}@${dependency.version} (${dependency.section}, ${dependency.group})`,
  );

  if (plan.packages.assumptions.length > 0) {
    packages.push(
      `  - assumed provided: ${plan.packages.assumptions.map((dependency) => dependency.name).join(', ')}`,
    );
  }

  return packages;
}

function renderInstallCommands(plan: AddPlan): readonly string[] {
  return plan.packages.installCommands.length === 0
    ? ['  None inferred']
    : plan.packages.installCommands.map((command) => `  - ${command}`);
}

function renderFiles(files: readonly AddPlan['files'][number][]): readonly string[] {
  return files.length === 0
    ? ['  None']
    : files.map(
        (file) =>
          `  - [${file.status}] ${file.path}${file.reason === undefined ? '' : ` — ${file.reason}`}`,
      );
}

function renderPlannedChanges(plan: AddPlan): readonly string[] {
  return plan.plannedChanges.length === 0
    ? ['  None']
    : plan.plannedChanges.map(
        (change) =>
          `  - [${change.category}] ${change.detail}${change.path === undefined ? '' : ` (${change.path})`}`,
      );
}

function renderConflict(file: AddPlan['conflicts'][number]): string {
  return `  - [${file.status}] ${file.path}${file.reason === undefined ? '' : ` — ${file.reason}`}`;
}
