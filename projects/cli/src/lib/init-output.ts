import { InitApplyError } from './init-apply.js';
import type { InitPlan } from './init-plan.js';
import { pluralize } from './output-format.js';

export function renderInitSummary(plan: InitPlan, noInstall: boolean): string {
  const packageCount = plan.packages.missing.length;
  const lines =
    plan.status === 'ready'
      ? [
          `Ready to initialize Duxkit AI${plan.project === null ? '' : ` for ${plan.project.name}`}.`,
          `  ${plan.plannedChanges.length} ${pluralize('change', plan.plannedChanges.length)} planned`,
          ...(packageCount === 0
            ? []
            : [
                `  ${packageCount} ${pluralize('package', packageCount)} ${noInstall ? 'required' : 'to install'}`,
              ]),
        ]
      : ['Could not initialize Duxkit AI.'];

  if (plan.ambiguities.length > 0) {
    lines.push(
      '',
      'Needs input',
      ...plan.ambiguities.map((ambiguity) => `  - ${ambiguity.flag}: ${ambiguity.message}`),
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

export function renderInitFailure(error: InitApplyError): string {
  const partial = error.partialChanges ? 'Partial changes were made.' : 'Init failed.';

  return [
    partial,
    `  completed: ${error.completedSteps.length === 0 ? 'None' : error.completedSteps.join(', ')}`,
    `  pending: ${error.pendingSteps.length === 0 ? 'None' : error.pendingSteps.join(', ')}`,
    `  error: ${error.message}`,
  ].join('\n');
}

export function renderVerboseInitPlan(plan: InitPlan): string {
  const lines = [
    `Init plan (${plan.status})`,
    `  workspace: ${plan.workspace.root}`,
    `  type: ${plan.workspace.type}`,
    `  project: ${plan.project?.name ?? 'None'}`,
    `  stylesheet: ${plan.stylesheet ?? 'None'}`,
    `  package manager: ${plan.packageManager}`,
    '',
    'Planned changes',
  ];

  if (plan.plannedChanges.length === 0) {
    lines.push('  None');
  } else {
    lines.push(...plan.plannedChanges.map((change) => `  - [${change.category}] ${change.detail}`));
  }

  lines.push('', 'Package install commands');
  lines.push(
    ...(plan.packages.installCommands.length === 0
      ? ['  None']
      : plan.packages.installCommands.map((command) => `  ${command}`)),
  );

  if (plan.warnings.length > 0) {
    lines.push('', 'Warnings', ...plan.warnings.map((warning) => `  - ${warning}`));
  }

  if (plan.ambiguities.length > 0) {
    lines.push(
      '',
      'Needs input',
      ...plan.ambiguities.map((ambiguity) => `  - ${ambiguity.flag}: ${ambiguity.message}`),
    );
  }

  return `${lines.join('\n')}\n`;
}
