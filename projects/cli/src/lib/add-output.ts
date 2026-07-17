import { AddApplyError, renderAddImportPath } from './add-apply.js';
import type { AddPlan } from './add-plan.js';
import { formatPrimitiveSelection, pluralize } from './output-format.js';

export function renderAddSummary(plan: AddPlan, noInstall: boolean): string {
  const fileCounts = countFileStatuses(plan.files);
  const packageCount = plan.packages.missing.length;
  const lines =
    plan.status === 'ready'
      ? [
          `Ready to add ${formatPrimitiveSelection(plan.requested)} to ${plan.componentDestination}.`,
          ...(plan.included.length === 0
            ? []
            : [
                `  Includes ${plan.included.length} required ${pluralize('primitive', plan.included.length)}: ${formatPrimitiveSelection(plan.included)}`,
              ]),
          ...renderFileCountSummary(fileCounts),
          ...(packageCount === 0
            ? []
            : [
                `  ${packageCount} ${pluralize('package', packageCount)} ${noInstall ? 'required' : 'to install'}`,
              ]),
        ]
      : ['Could not add the selected primitives.'];

  if (plan.errors.length > 0) {
    lines.push('', 'Errors', ...plan.errors.map((error) => `  - ${error}`));
  }

  if (plan.ambiguities.length > 0) {
    lines.push('', 'Needs input', ...plan.ambiguities.map((ambiguity) => `  - ${ambiguity}`));
  }

  if (plan.conflicts.length > 0) {
    lines.push(
      '',
      'Conflicts',
      `  ${plan.conflicts.length} ${pluralize('file', plan.conflicts.length)} would be overwritten.`,
    );
  }

  if (noInstall && plan.packages.installCommands.length > 0) {
    lines.push(
      '',
      'Install dependencies manually',
      ...plan.packages.installCommands.map((command) => `  ${command}`),
    );
  }

  if (plan.warnings.length > 0) {
    lines.push('', 'Warnings', ...plan.warnings.map((warning) => `  - ${warning}`));
  }

  lines.push('', 'Run with --verbose to see every planned change.');

  return `${lines.join('\n')}\n`;
}

export function renderAddSuccess(plan: AddPlan, verbose: boolean): string {
  const displayedPrimitives = verbose ? plan.requested : plan.requested.slice(0, 3);
  const imports = displayedPrimitives.map(
    (primitive) =>
      `  import * as ${toPascalCase(primitive)}Primitive from '${renderAddImportPath(plan, primitive)}';`,
  );
  const omittedCount = plan.requested.length - displayedPrimitives.length;

  return (
    [
      `Added ${formatPrimitiveSelection(plan.requested)}.`,
      '',
      'Import examples',
      ...imports,
      ...(omittedCount === 0 ? [] : [`  …and ${omittedCount} more`]),
      '',
      'Generated files are now part of your app and can be edited.',
    ].join('\n') + '\n'
  );
}

export function renderAddFailure(error: AddApplyError): string {
  const partial = error.partialChanges ? 'Partial changes were made.' : 'Add failed.';

  return [
    partial,
    `  completed: ${error.completedSteps.length === 0 ? 'None' : error.completedSteps.join(', ')}`,
    `  pending: ${error.pendingSteps.length === 0 ? 'None' : error.pendingSteps.join(', ')}`,
    `  error: ${error.message}`,
  ].join('\n');
}

export function renderVerboseAddPlan(plan: AddPlan): string {
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
  ];

  if (plan.conflicts.length > 0) {
    lines.push('', 'Conflicts', ...plan.conflicts.map(renderConflict));
  }

  if (plan.errors.length > 0) {
    lines.push('', 'Errors', ...plan.errors.map((error) => `  - ${error}`));
  }

  if (plan.ambiguities.length > 0) {
    lines.push('', 'Needs input', ...plan.ambiguities.map((ambiguity) => `  - ${ambiguity}`));
  }

  if (plan.warnings.length > 0) {
    lines.push('', 'Warnings', ...plan.warnings.map((warning) => `  - ${warning}`));
  }

  return `${lines.join('\n')}\n`;
}

function countFileStatuses(
  files: AddPlan['files'],
): Readonly<Record<AddPlan['files'][number]['status'], number>> {
  return files.reduce<Record<AddPlan['files'][number]['status'], number>>(
    (counts, file) => {
      counts[file.status] += 1;
      return counts;
    },
    { blocked: 0, create: 0, customized: 0, foreign: 0, unchanged: 0 },
  );
}

function renderFileCountSummary(
  counts: Readonly<Record<AddPlan['files'][number]['status'], number>>,
): readonly string[] {
  const summaries = [
    counts.create > 0 ? `${counts.create} ${pluralize('file', counts.create)} to create` : null,
    counts.customized > 0
      ? `${counts.customized} customized ${pluralize('file', counts.customized)} to replace`
      : null,
    counts.unchanged > 0
      ? `${counts.unchanged} ${pluralize('file', counts.unchanged)} unchanged`
      : null,
  ].filter((summary): summary is string => summary !== null);

  return summaries.length === 0 ? ['  No file changes'] : [`  ${summaries.join(', ')}`];
}

function toPascalCase(value: string): string {
  return value
    .split('-')
    .map((part) => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
    .join('');
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

function renderConflict(file: AddPlan['conflicts'][number]): string {
  return `  - [${file.status}] ${file.path}${file.reason === undefined ? '' : ` — ${file.reason}`}`;
}
