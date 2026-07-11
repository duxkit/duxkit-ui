import { resolve } from 'node:path';
import type { CliIo } from './cli.js';
import { CliCommandError } from './cli-errors.js';
import { confirmApply, isInteractive, printJsonPlanForConfirmation } from './cli-interaction.js';
import { applyAddPlan, AddApplyError, renderAddImportPath } from './add-apply.js';
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
  const plan = await createAddPlan(inputs, options, resolve(options.cwd ?? process.cwd()));

  if (plan.status === 'blocked') {
    writePlanOutput(plan, options.json === true, io);

    if (options.json !== true && plan.nextSteps.length > 0) {
      io.stderr.write(`${plan.nextSteps.join('\n')}\n`);
    }

    throw new CliCommandError(1);
  }

  if (options.dryRun === true) {
    writePlanOutput(plan, options.json === true, io);
    return;
  }

  if (plan.plannedChanges.length > 0 && options.yes !== true && !isInteractive(io)) {
    const blockedPlan = {
      ...plan,
      ambiguities: [
        ...plan.ambiguities,
        'Run add interactively or pass --yes before allowing writes in a non-interactive terminal.',
      ],
      status: 'blocked' as const,
    };
    writePlanOutput(blockedPlan, options.json === true, io);

    if (options.json !== true) {
      io.stderr.write('Pass --yes before allowing add writes in a non-interactive terminal.\n');
    }

    throw new CliCommandError(1);
  }

  if (options.json !== true) {
    io.stdout.write(renderHumanAdd(plan));
  }

  if (options.yes !== true && isInteractive(io) && plan.plannedChanges.length > 0) {
    printJsonPlanForConfirmation(plan, options.json === true, io);
    const confirmed = await confirmApply(io);

    if (!confirmed) {
      const cancelledPlan = {
        ...plan,
        ambiguities: [...plan.ambiguities, 'Add cancelled.'],
        status: 'blocked' as const,
      };

      if (options.json === true) {
        io.stdout.write(`${JSON.stringify(cancelledPlan, null, 2)}\n`);
      } else {
        io.stderr.write('Add cancelled.\n');
      }

      throw new CliCommandError(1);
    }
  }

  try {
    const result = await applyAddPlan(plan, {
      noInstall: options.noInstall === true || options.install === false,
    });
    const appliedPlan = {
      ...plan,
      applied: true,
      completedPrimitives: result.completedPrimitives,
      completedSteps: result.completedSteps,
      skippedInstall: result.skippedInstall,
      status: 'applied' as const,
    };

    if (options.json === true) {
      io.stdout.write(`${JSON.stringify(appliedPlan, null, 2)}\n`);
    } else {
      io.stdout.write(renderAddSuccess(plan));
    }
  } catch (error) {
    if (!(error instanceof AddApplyError)) {
      throw error;
    }

    const failedPlan = {
      ...plan,
      applied: false,
      completedSteps: error.completedSteps,
      error: error.message,
      message: error.partialChanges ? 'Partial changes were made' : 'Add failed',
      pendingSteps: error.pendingSteps,
      partialChanges: error.partialChanges,
      status: 'failed' as const,
    };

    if (options.json === true) {
      io.stdout.write(`${JSON.stringify(failedPlan, null, 2)}\n`);
    } else {
      io.stderr.write(`${renderAddFailure(error)}\n`);
    }

    throw new CliCommandError(1);
  }
}

function writePlanOutput(plan: AddPlan, json: boolean, io: CliIo): void {
  if (json) {
    io.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
  } else {
    io.stdout.write(renderHumanAdd(plan));
  }
}

function renderAddSuccess(plan: AddPlan): string {
  const imports = plan.requested.map(
    (primitive) =>
      `  import * as ${toPascalCase(primitive)}Primitive from '${renderAddImportPath(plan, primitive)}';`,
  );

  return (
    [
      'Add applied.',
      '',
      'Import examples',
      ...imports,
      '',
      'Copied Duxkit AI component source into your app.',
      'These files are yours to edit. Rerun with --dry-run before overwriting customized files.',
      'Runtime behavior remains provided by installed Duxkit, Angular, and supporting packages.',
    ].join('\n') + '\n'
  );
}

function renderAddFailure(error: AddApplyError): string {
  const partial = error.partialChanges ? 'Partial changes were made.' : 'Add failed.';

  return [
    partial,
    `  completed: ${error.completedSteps.length === 0 ? 'None' : error.completedSteps.join(', ')}`,
    `  pending: ${error.pendingSteps.length === 0 ? 'None' : error.pendingSteps.join(', ')}`,
    `  error: ${error.message}`,
  ].join('\n');
}

function toPascalCase(value: string): string {
  return value
    .split('-')
    .map((part) => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
    .join('');
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
