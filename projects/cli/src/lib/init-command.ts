import { createInterface } from 'node:readline/promises';
import { resolve } from 'node:path';
import type { CliIo } from './cli.js';
import { CliCommandError } from './cli-errors.js';
import { applyInitPlan, InitApplyError } from './init-apply.js';
import {
  createInitPlan,
  type InitMode,
  type InitPlan,
  type InitPlannerOptions,
} from './init-plan.js';
import { inspectWorkspace } from './workspace-state.js';

export interface InitCommandOptions extends InitPlannerOptions {
  readonly dryRun?: boolean;
  readonly install?: boolean;
  readonly json?: boolean;
  readonly noInstall?: boolean;
}

export async function runInitCommand(options: InitCommandOptions, io: CliIo): Promise<void> {
  const cwd = resolve(options.cwd ?? process.cwd());
  let plan = await createInitPlan(options, cwd);

  if (plan.status === 'blocked' && isInteractive(options)) {
    const promptedOptions = await promptForInitAmbiguities(options, plan);

    if (promptedOptions !== null) {
      plan = await createInitPlan(promptedOptions, cwd);
    }
  }

  if (options.dryRun === true || plan.status === 'blocked') {
    writePlanOutput(plan, options.json === true, io);

    if (plan.status === 'blocked') {
      reportBlocked(plan, options.json === true, io);
      throw new CliCommandError(1);
    }

    return;
  }

  if (plan.plannedChanges.length > 0 && !options.yes && !isInteractive(options)) {
    const blockedPlan = withBlockedAmbiguity(
      plan,
      'Run init interactively or pass --yes before allowing writes in a non-interactive terminal.',
    );
    writePlanOutput(blockedPlan, options.json === true, io);
    reportBlocked(blockedPlan, options.json === true, io);
    throw new CliCommandError(1);
  }

  if (options.json !== true) {
    io.stdout.write(renderHumanInit(plan));
  }

  if (!options.yes && isInteractive(options) && plan.plannedChanges.length > 0) {
    const confirmed = await confirmInitApply();

    if (!confirmed) {
      const cancelledPlan = withBlockedAmbiguity(plan, 'Initialization cancelled.');
      writePlanOutput(cancelledPlan, options.json === true, io);
      reportBlocked(cancelledPlan, options.json === true, io);
      throw new CliCommandError(1);
    }
  }

  try {
    const result = await applyInitPlan(plan, {
      noInstall: options.noInstall === true || options.install === false,
    });
    const appliedPlan = {
      ...plan,
      applied: true,
      completedSteps: result.completedSteps,
      skippedInstall: result.skippedInstall,
      status: 'applied' as const,
    };

    if (options.json === true) {
      io.stdout.write(`${JSON.stringify(appliedPlan, null, 2)}\n`);
    } else {
      io.stdout.write('Initialization applied.\n');
    }
  } catch (error) {
    if (!(error instanceof InitApplyError)) {
      throw error;
    }

    const failedPlan = {
      ...plan,
      completedSteps: error.completedSteps,
      error: error.message,
      pendingSteps: error.pendingSteps,
      status: 'failed' as const,
    };

    if (options.json === true) {
      io.stdout.write(`${JSON.stringify(failedPlan, null, 2)}\n`);
    } else {
      io.stderr.write(`${renderApplyFailure(error)}\n`);
    }

    throw new CliCommandError(1);
  }
}

function writePlanOutput(plan: InitPlan, json: boolean, io: CliIo): void {
  if (json) {
    io.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
  } else {
    io.stdout.write(renderHumanInit(plan));
  }
}

function reportBlocked(plan: InitPlan, json: boolean, io: CliIo): void {
  if (!json) {
    io.stderr.write(`${plan.nextSteps.join('\n')}\n`);
  }
}

function withBlockedAmbiguity(plan: InitPlan, message: string): InitPlan {
  const ambiguity = { flag: '--yes', message };

  return {
    ...plan,
    ambiguities: [...plan.ambiguities, ambiguity],
    nextSteps: [...plan.nextSteps, `Provide ${ambiguity.flag}: ${ambiguity.message}`],
    status: 'blocked',
  };
}

async function confirmInitApply(): Promise<boolean> {
  const readline = createInterface({ input: process.stdin, output: process.stderr });

  try {
    const answer = await readline.question('Apply these changes? (y/N) ');
    return answer.trim().toLowerCase() === 'y';
  } finally {
    readline.close();
  }
}

function renderApplyFailure(error: InitApplyError): string {
  return [
    'Partial changes were made.',
    `  completed: ${error.completedSteps.length === 0 ? 'None' : error.completedSteps.join(', ')}`,
    `  pending: ${error.pendingSteps.length === 0 ? 'None' : error.pendingSteps.join(', ')}`,
    `  error: ${error.message}`,
  ].join('\n');
}

function isInteractive(options: InitCommandOptions): boolean {
  return process.stdin.isTTY === true && process.stdout.isTTY === true;
}

async function promptForInitAmbiguities(
  options: InitCommandOptions,
  plan: InitPlan,
): Promise<InitPlannerOptions | null> {
  const workspace = await inspectWorkspace(plan.workspace.root);
  const prompted: {
    -readonly [Key in keyof InitPlannerOptions]?: InitPlannerOptions[Key];
  } = { ...options };
  const readline = createInterface({ input: process.stdin, output: process.stderr });
  let changed = false;

  try {
    for (const ambiguity of plan.ambiguities) {
      const flag = ambiguity.flag;

      if (flag.includes('--force')) {
        const answer = await readline.question(
          'Use the explicit flags and update duxkit-ai.json? (y/N) ',
        );

        if (answer.trim().toLowerCase() === 'y') {
          prompted.force = true;
          changed = true;
        }
      } else if (flag.startsWith('--project')) {
        const choices = workspace.projects.map((project) => project.name).join(', ');
        const answer = await readline.question(
          `Which project should Duxkit AI configure (${choices})? `,
        );

        if (answer.trim().length > 0) {
          prompted.project = answer.trim();
          changed = true;
        }
      } else if (flag.startsWith('--stylesheet')) {
        const answer = await readline.question('Which stylesheet should receive Tailwind setup? ');

        if (answer.trim().length > 0) {
          prompted.stylesheet = answer.trim();
          changed = true;
        }
      } else if (flag.startsWith('--tokens')) {
        const answer = await readline.question('Add the missing theme tokens? (Y/n) ');
        prompted.tokens = answer.trim().toLowerCase() === 'n' ? 'skip' : 'add';
        changed = true;
      } else if (flag.startsWith('--tailwind')) {
        const answer = await readline.question(
          'Skip automatic Tailwind migration and leave it for a manual step? (y/N) ',
        );

        if (answer.trim().toLowerCase() === 'y') {
          prompted.tailwind = 'skip';
          changed = true;
        }
      } else if (flag.startsWith('--postcss')) {
        const answer = await readline.question(
          'Skip automatic PostCSS editing and leave it for a manual step? (y/N) ',
        );

        if (answer.trim().toLowerCase() === 'y') {
          prompted.postcss = 'skip';
          changed = true;
        }
      }
    }
  } finally {
    readline.close();
  }

  return changed ? prompted : null;
}

function renderHumanInit(plan: InitPlan): string {
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

  if (plan.nextSteps.length > 0) {
    lines.push('', 'Next steps', ...plan.nextSteps.map((step) => `  - ${step}`));
  }

  return `${lines.join('\n')}\n`;
}

export function isInitMode(value: string): value is InitMode {
  return value === 'add' || value === 'skip' || value === 'require-existing';
}
